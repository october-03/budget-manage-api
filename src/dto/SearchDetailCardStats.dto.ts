import { CardPaymentType } from './CardPaymentType.dto';

export interface SearchDetailCardStatsDto {
  startDate: string;
  endDate: string;
  page: number;
  searchKeyword?: string;
  transaction_type?: CardPaymentType;
  card_id?: number;
}
