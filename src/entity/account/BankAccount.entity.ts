import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentInfo } from '../card/PaymentInfo.entity';
import { BankTransactionLog } from './BankTransactionLog.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  balance: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => PaymentInfo, (paymentInfo) => paymentInfo.paymentAccount, { nullable: true })
  cards: PaymentInfo[];

  @OneToMany(() => BankTransactionLog, (transactionLog) => transactionLog.account, { nullable: true })
  transactionLogs: BankTransactionLog[];
}
