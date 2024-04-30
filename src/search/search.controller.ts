import { Controller, Get, Param, Query } from '@nestjs/common';
import { CardService } from 'src/card/card.service';
import { CardPaymentType } from 'src/dto/CardPaymentType.dto';
import { DefaultResponseDto } from 'src/dto/DefaultResponse.dto';
import { SearchCardTransactionLogsDto } from 'src/dto/SearchCardTransactionLogs.dto';
import { SearchService } from './search.service';
import { ErrorHandler } from 'src/dto/ErrorHandler.enum';
import { SearchMonthlyStatDto } from 'src/dto/SearchMonthlyAccountStat.dto';
import { SearchBankTransactionLogsDto } from 'src/dto/SearcrBankTransactionLogs.dto';
import { TransactionType } from 'src/dto/TransactionType.enum';

@Controller('search')
export class SearchController {
  constructor(
    private readonly cardService: CardService,
    private readonly searchService: SearchService,
  ) {}

  @Get('card-logs')
  async getCardLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: number,
    @Query('searchKeyword') searchKeyword: string,
    @Query('transaction_type') transaction_type: string,
    @Query('card_id') card_id: number,
  ): Promise<DefaultResponseDto<SearchCardTransactionLogsDto>> {
    const response = new DefaultResponseDto<SearchCardTransactionLogsDto>();
    const res = await this.searchService.searchDetailCardStats({
      endDate,
      startDate,
      page,
      searchKeyword,
      transaction_type: CardPaymentType[transaction_type],
      id: card_id,
    });

    response.data = res;
    response.message = 'Transaction logs retrieved successfully';
    response.resultCode = '0000';

    return response;
  }

  @Get('monthly-stats/:date')
  async getMonthlyStats(@Param('date') date: string): Promise<DefaultResponseDto<SearchMonthlyStatDto>> {
    try {
      const stats = await this.searchService.searchMonthlyStat(date);
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

  @Get('account-logs')
  async getAccountLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: number,
    @Query('searchKeyword') searchKeyword: string,
    @Query('transaction_type') transaction_type: string,
    @Query('account_id') account_id: number,
  ): Promise<DefaultResponseDto<SearchBankTransactionLogsDto>> {
    const response = new DefaultResponseDto<SearchBankTransactionLogsDto>();
    const res = await this.searchService.searchDetailBankStats({
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
      const stats = await this.searchService.searchCardList();
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
