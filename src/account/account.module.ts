import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from '../entity/account/BankAccount.entity';
import { BankTransactionLog } from 'src/entity/account/BankTransactionLog.entity';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, BankTransactionLog]), SearchModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
