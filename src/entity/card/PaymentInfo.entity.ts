import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './Card.entity';
import { BankAccount } from '../account/BankAccount.entity';

@Entity('payment_info')
export class PaymentInfo {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => Card, (card) => card.paymentInfo)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'payment_date' })
  paymentDate: number;

  @ManyToOne(() => BankAccount, (account) => account.cards, { nullable: true })
  paymentAccount: BankAccount;
}
