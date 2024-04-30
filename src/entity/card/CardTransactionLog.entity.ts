import { CardPaymentType } from 'src/dto/CardPaymentType.dto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './Card.entity';

@Entity('card_transaction_logs')
export class CardTransactionLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'payment_type' })
  paymentType: CardPaymentType;

  @Column()
  amount: number;

  @ManyToOne(() => Card, (card) => card.transactionLogs)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'transaction_date' })
  transactionDate: Date;

  @Column()
  description: string;
}
