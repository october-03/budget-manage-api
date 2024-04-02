import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { RegisterCardDto } from 'src/dto/RegisterCard.dto';
import { Card } from 'src/entity/card/Card.entity';
import { PaymentInfo } from 'src/entity/card/PaymentInfo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,

    @InjectRepository(PaymentInfo)
    private paymentInfoRepository: Repository<PaymentInfo>,

    @Inject(AccountService)
    private readonly accountService: AccountService,
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
}
