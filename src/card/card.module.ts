import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../entity/card/Card.entity';
import { PaymentInfo } from '../entity/card/PaymentInfo.entity';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, PaymentInfo]), AccountModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
