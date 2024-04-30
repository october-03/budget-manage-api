import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from '../entity/account/BankAccount.entity';
import { BankTransactionLog } from 'src/entity/account/BankTransactionLog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, BankTransactionLog])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
