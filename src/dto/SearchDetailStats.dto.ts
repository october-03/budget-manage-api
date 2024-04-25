import { CardPaymentType } from './CardPaymentType.dto';
import { TransactionType } from './TransactionType.enum';

export interface SearchDetailStatsDto {
  startDate: string;
  endDate: string;
  page: number;
  searchKeyword?: string;
  transaction_type?: CardPaymentType | TransactionType;
  id?: number;
}
