import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentInfo } from './PaymentInfo.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @OneToOne(() => PaymentInfo, (paymentInfo) => paymentInfo.card, { nullable: true })
  @JoinColumn({ name: 'payment_info_id' })
  paymentInfo: PaymentInfo;

  @CreateDateColumn()
  created_at: Date;
}
