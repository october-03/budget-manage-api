import { Body, Controller, Get, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from 'src/entity/card/Card.entity';
import { DefaultResponseDto } from 'src/dto/DefaultResponse.dto';
import { RegisterCardDto } from 'src/dto/RegisterCard.dto';
import { ErrorHandler } from 'src/dto/ErrorHandler.enum';
import { AddCardTransactionDto } from 'src/dto/AddCardTransaction.dto';

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

  @Get('all')
  async getCards(): Promise<DefaultResponseDto<Card[]>> {
    try {
      const cards = await this.cardService.findAllCards();
      const response = new DefaultResponseDto<Card[]>();
      response.data = cards;
      response.message = 'Cards retrieved successfully';
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
}
