import { CardPaymentType } from './CardPaymentType.dto';

export class AddCardTransactionDto {
  amount: number;
  cardId: number;
  transactionDate: Date;
  description: string;
  paymentType: CardPaymentType;
  installmentMonths: number = 1;
}
