import { BankTransactionLog } from 'src/entity/account/BankTransactionLog.entity';

export interface SearchBankTransactionLogsDto {
  history: BankTransactionLog[];
  income_amount: number;
  expense_amount: number;
  total_amount: number;
  total_count: number;
}
