export interface SearchMonthlyStatDto {
  dailyStats: DailyStat[];
  income: number;
  expense: number;
  card: number;
  balance: number;
}

export interface DailyStat {
  date: string;
  income: number;
  expense: number;
  card: number;
}
