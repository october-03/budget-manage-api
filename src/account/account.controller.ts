import { Body, Controller, Get, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { RegisterAccountDto } from '../dto/RegisterAccount.dto';
import { DefaultResponseDto } from '../dto/DefaultResponse.dto';
import { BankAccount } from '../entity/account/BankAccount.entity';
import { ErrorHandler } from '../dto/ErrorHandler.enum';
import { AddTransactionDto } from 'src/dto/AddTransaction.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  async registerAccount(@Body() req: RegisterAccountDto): Promise<DefaultResponseDto<BankAccount>> {
    try {
      const bankAccount = await this.accountService.registerAccount(req);
      const response = new DefaultResponseDto<BankAccount>();
      response.data = bankAccount;
      response.message = 'Account created successfully';
      response.resultCode = '0000';
      return response;
    } catch (e) {
      const error = ErrorHandler[e.message];
      const response = new DefaultResponseDto<null>();
      response.data = null;
      response.message = error;
      response.resultCode = e.message;
      return response;
    }
  }

  @Post('transaction')
  async addTransaction(@Body() req: AddTransactionDto): Promise<DefaultResponseDto<BankAccount>> {
    try {
      const transaction = await this.accountService.addTransaction(req);
      const response = new DefaultResponseDto<BankAccount>();
      response.data = transaction;
      response.message = 'Transaction completed successfully';
      response.resultCode = '0000';
      return response;
    } catch (e) {
      const error = ErrorHandler[e.message];
      const response = new DefaultResponseDto<null>();
      response.data = null;
      response.message = error;
      response.resultCode = e.message;
      return response;
    }
  }

  @Get('all')
  async getBankAccounts(): Promise<DefaultResponseDto<BankAccount[]>> {
    try {
      const bankAccounts = await this.accountService.getBankAccounts();
      const response = new DefaultResponseDto<BankAccount[]>();
      response.data = bankAccounts;
      response.message = 'Bank accounts retrieved successfully';
      response.resultCode = '0000';
      return response;
    } catch (e) {
      const error = ErrorHandler[e.message];
      const response = new DefaultResponseDto<null>();
      response.data = null;
      response.message = error;
      response.resultCode = e.message;
      return response;
    }
  }
}
