import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionType } from '../../dto/TransactionType.enum';
import { BankAccount } from './BankAccount.entity';

@Entity('bank_transaction_logs')
export class BankTransactionLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'transaction_type' })
  transactionType: TransactionType;

  @Column()
  amount: number;

  @ManyToOne(() => BankAccount, (account) => account.transactionLogs)
  account: BankAccount;

  @Column({ name: 'transaction_date' })
  transactionDate: Date;

  @Column()
  description: string;
}
