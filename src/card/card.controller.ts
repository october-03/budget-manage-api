import { Body, Controller, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from 'src/entity/card/Card.entity';
import { DefaultResponseDto } from 'src/dto/DefaultResponse.dto';
import { RegisterCardDto } from 'src/dto/RegisterCard.dto';
import { ErrorHandler } from 'src/dto/ErrorHandler.enum';

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
}
