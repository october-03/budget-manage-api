import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentInfo } from './PaymentInfo.entity';
import { CardTransactionLog } from './CardTransactionLog.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @OneToOne(() => PaymentInfo, (paymentInfo) => paymentInfo.card, { nullable: true })
  @JoinColumn({ name: 'payment_info_id' })
  paymentInfo: PaymentInfo;

  @OneToMany(() => CardTransactionLog, (CardTransactionLog) => CardTransactionLog.card, { nullable: true })
  transactionLogs: CardTransactionLog[];

  @CreateDateColumn()
  created_at: Date;
}
