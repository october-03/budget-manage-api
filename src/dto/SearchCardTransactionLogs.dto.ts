import { CardTransactionLog } from 'src/entity/card/CardTransactionLog.entity';

export interface SearchCardTransactionLogsDto {
  history: CardTransactionLog[];
  installments_amount: number;
  full_amount: number;
  total_amount: number;
  total_count: number;
}
