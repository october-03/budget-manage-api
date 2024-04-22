import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from '../entity/account/BankAccount.entity';
import { Repository } from 'typeorm';
import { AddTransactionDto } from 'src/dto/AddTransaction.dto';
import { BankTransactionLog } from 'src/entity/account/BankTransactionLog.entity';
import { TransactionType } from 'src/dto/TransactionType.enum';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,

    @InjectRepository(BankTransactionLog)
    private bankTransactionLogRepository: Repository<BankTransactionLog>,

    private readonly searchService: SearchService,
  ) {}

  async getBankAccounts(): Promise<BankAccount[]> {
    return this.bankAccountRepository.find();
  }

  public async getBankAccountById(id: number): Promise<BankAccount> {
    return this.bankAccountRepository.findOne({ where: { id } });
  }

  async getBankAccountByName(name: string): Promise<BankAccount> {
    return this.bankAccountRepository.findOne({ where: { name } });
  }

  async registerAccount(name: string): Promise<BankAccount> {
    let bankAccount = await this.getBankAccountByName(name);
    if (bankAccount) {
      throw new Error('A0001');
    }

    bankAccount = new BankAccount();
    bankAccount.name = name;
    bankAccount.balance = 0;

    return this.bankAccountRepository.save(bankAccount);
  }

  async addTransaction(req: AddTransactionDto): Promise<BankAccount> {
    const bankAccount = await this.getBankAccountById(req.accountId);
    if (!bankAccount) {
      throw new Error('A0002');
    }

    const newTransaction = new BankTransactionLog();
    newTransaction.account = bankAccount;
    newTransaction.amount = req.amount;
    newTransaction.description = req.description;
    newTransaction.transactionDate = req.transactionDate;
    newTransaction.transactionType = TransactionType[req.transactionType];

    if (newTransaction.transactionType === TransactionType.EXPENSE) {
      if (bankAccount.balance < req.amount) {
        throw new Error('A0003');
      }
      bankAccount.balance -= req.amount;
    } else {
      bankAccount.balance += req.amount;
    }

    await this.bankTransactionLogRepository.save(newTransaction);
    return this.bankAccountRepository.save(bankAccount);
  }

  async getAccount(name: string): Promise<BankAccount> {
    const result = await this.bankAccountRepository.find({ where: { name } });

    console.log(result);

    return result[0];
  }
}
