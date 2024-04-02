export class AddTransactionDto {
  transactionType: string;
  amount: number;
  accountId: number;
  transactionDate: Date;
  description: string;
}
