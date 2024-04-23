import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { RegisterAccountDto } from '../dto/RegisterAccount.dto';
import { DefaultResponseDto } from '../dto/DefaultResponse.dto';
import { BankAccount } from '../entity/account/BankAccount.entity';
import { ErrorHandler } from '../dto/ErrorHandler.enum';
import { AddTransactionDto } from 'src/dto/AddTransaction.dto';
import { SearchMonthlyStatDto } from 'src/dto/SearchMonthlyAccountStat.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  async registerAccount(@Body() req: RegisterAccountDto): Promise<DefaultResponseDto<BankAccount>> {
    try {
      const bankAccount = await this.accountService.registerAccount(req.name);
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
  async getAccount(): Promise<DefaultResponseDto<BankAccount[]>> {
    try {
      const accounts = await this.accountService.getAccount();
      const response = new DefaultResponseDto<BankAccount[]>();
      response.data = accounts;
      response.message = "Account's data retrieved successfully";
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

  @Get('monthly-stats/:date')
  async getMonthlyStats(@Param('date') date: string): Promise<DefaultResponseDto<SearchMonthlyStatDto>> {
    try {
      const stats = await this.accountService.getMonthlyStats(date);
      const response = new DefaultResponseDto<SearchMonthlyStatDto>();
      response.data = stats;
      response.message = 'Monthly stats retrieved successfully';
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
