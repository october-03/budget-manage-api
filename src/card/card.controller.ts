import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from 'src/entity/card/Card.entity';
import { DefaultResponseDto } from 'src/dto/DefaultResponse.dto';
import { RegisterCardDto } from 'src/dto/RegisterCard.dto';
import { ErrorHandler } from 'src/dto/ErrorHandler.enum';
import { AddCardTransactionDto } from 'src/dto/AddCardTransaction.dto';
import { SearchCardTransactionLogsDto } from 'src/dto/SearchCardTransactionLogs.dto';
import { CardPaymentType } from 'src/dto/CardPaymentType.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('register')
  async registerCard(@Body() req: RegisterCardDto): Promise<DefaultResponseDto<Card>> {
    try {
      const card = await this.cardService.RegisterCard(req);
      const response = new DefaultResponseDto<Card>();
      response.data = card;
      response.message = 'Card created successfully';
      response.resultCode = '0000';
      return response;
    } catch (e) {
      const response = new DefaultResponseDto<null>();
      response.data = null;
      response.message = ErrorHandler[e.message];
      response.resultCode = e.message;
      return response;
    }
  }

  @Post('transaction')
  async addTransaction(@Body() req: AddCardTransactionDto) {
    try {
      const transaction = await this.cardService.addTransaction(req);
      const response = new DefaultResponseDto<Card>();
      response.data = transaction;
      response.message = 'Transaction completed successfully';
      response.resultCode = '0000';
      return response;
    } catch (e) {
      const response = new DefaultResponseDto<null>();
      response.data = null;
      response.message = ErrorHandler[e.message];
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
    @Query('card_id') card_id: number,
  ): Promise<DefaultResponseDto<SearchCardTransactionLogsDto>> {
    const response = new DefaultResponseDto<SearchCardTransactionLogsDto>();
    const res = await this.cardService.searchTransactionLogs({
      endDate,
      startDate,
      page,
      searchKeyword,
      transaction_type: CardPaymentType[transaction_type],
      card_id,
    });

    response.data = res;
    response.message = 'Transaction logs retrieved successfully';
    response.resultCode = '0000';

    return response;
  }
}
