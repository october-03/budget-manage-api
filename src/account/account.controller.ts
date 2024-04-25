import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { RegisterAccountDto } from '../dto/RegisterAccount.dto';
import { DefaultResponseDto } from '../dto/DefaultResponse.dto';
import { BankAccount } from '../entity/account/BankAccount.entity';
import { ErrorHandler } from '../dto/ErrorHandler.enum';
import { AddTransactionDto } from 'src/dto/AddTransaction.dto';
import { SearchMonthlyStatDto } from 'src/dto/SearchMonthlyAccountStat.dto';
import { SearchBankTransactionLogsDto } from 'src/dto/SearcrBankTransactionLogs.dto';
import { TransactionType } from 'src/dto/TransactionType.enum';

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

  @Get('logs')
  async getTransactionLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: number,
    @Query('searchKeyword') searchKeyword: string,
    @Query('transaction_type') transaction_type: string,
    @Query('account_id') account_id: number,
  ): Promise<DefaultResponseDto<SearchBankTransactionLogsDto>> {
    const response = new DefaultResponseDto<SearchBankTransactionLogsDto>();
    const res = await this.accountService.searchTransactionLogs({
      endDate,
      startDate,
      page,
      searchKeyword,
      transaction_type: TransactionType[transaction_type],
      id: account_id,
    });

    response.data = res;
    response.message = 'Transaction logs retrieved successfully';
    response.resultCode = '0000';

    return response;
  }

  @Get('all')
  async getAllStats(): Promise<DefaultResponseDto<any>> {
    try {
      const stats = await this.accountService.getMonthAllStats();
      const response = new DefaultResponseDto<any>();
      response.data = stats;
      response.message = 'Stats retrieved successfully';
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
