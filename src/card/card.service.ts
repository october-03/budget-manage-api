import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { AddCardTransactionDto } from 'src/dto/AddCardTransaction.dto';
import { CardPaymentType } from 'src/dto/CardPaymentType.dto';
import { RegisterCardDto } from 'src/dto/RegisterCard.dto';
import { SearchCardTransactionLogsDto } from 'src/dto/SearchCardTransactionLogs.dto';
import { SearchDetailStatsDto } from 'src/dto/SearchDetailStats.dto';
import { Card } from 'src/entity/card/Card.entity';
import { CardTransactionLog } from 'src/entity/card/CardTransactionLog.entity';
import { PaymentInfo } from 'src/entity/card/PaymentInfo.entity';
import { SearchService } from 'src/search/search.service';
import InstallmentCalculator from 'src/util/InstallmentCalculator';
import { Repository } from 'typeorm';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,

    @InjectRepository(PaymentInfo)
    private paymentInfoRepository: Repository<PaymentInfo>,

    @InjectRepository(CardTransactionLog)
    private cardTransactionLogRepository: Repository<CardTransactionLog>,

    @Inject(AccountService)
    private readonly accountService: AccountService,

    private readonly searchService: SearchService,
  ) {}

  async findCardById(id: number): Promise<Card> {
    return this.cardRepository.findOne({ where: { id } });
  }

  async findCardByName(name: string): Promise<Card> {
    return this.cardRepository.findOne({ where: { name } });
  }

  async RegisterCard(req: RegisterCardDto): Promise<Card> {
    let card = await this.findCardByName(req.name);

    if (card) {
      throw new Error('C0001');
    }

    const paymentAccount = await this.accountService.getBankAccountById(req.paymentAccountId);

    if (!paymentAccount) {
      throw new Error('A0002');
    }

    card = this.cardRepository.create({
      name: req.name,
    });

    await this.cardRepository.save(card);

    const paymentInfo = this.paymentInfoRepository.create({
      paymentDate: req.paymentDate,
      paymentAccount,
      card,
    });

    await this.paymentInfoRepository.save(paymentInfo);

    await this.cardRepository.update(card.id, { paymentInfo });

    return { ...card, paymentInfo };
  }

  async addTransaction(req: AddCardTransactionDto): Promise<Card> {
    const card = await this.findCardById(req.cardId);

    if (!card) {
      throw new Error('C0002');
    }

    const paymentType = CardPaymentType[req.paymentType];

    if (paymentType === CardPaymentType.FULL) {
      req.installmentMonths = 1;
    }

    const installmentsAmounts = InstallmentCalculator(req.amount, req.installmentMonths, req.transactionDate);

    for (const [index, installmentsAmount] of installmentsAmounts.entries()) {
      const transactionLog = this.cardTransactionLogRepository.create({
        amount: installmentsAmount.amount,
        card,
        paymentType,
        transactionDate: installmentsAmount.date,
        description: `${req.description}`,
      });

      if (installmentsAmounts.length > 1) {
        transactionLog.description = `${req.description} 할부(${index + 1} / ${req.installmentMonths})`;
      }

      await this.cardTransactionLogRepository.save(transactionLog);
    }

    return card;
  }

  async searchTransactionLogs(req: SearchDetailStatsDto): Promise<SearchCardTransactionLogsDto> {
    const res = await this.searchService.searchDetailCardStats(req);
    return res;
  }
}
