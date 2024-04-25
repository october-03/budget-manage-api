import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { DailyStat, SearchMonthlyStatDto } from 'src/dto/SearchMonthlyAccountStat.dto';
import { EsService } from './es.service';
import { SearchCardTransactionLogsDto } from 'src/dto/SearchCardTransactionLogs.dto';
import { SearchDetailStatsDto } from 'src/dto/SearchDetailStats.dto';
import { SearchBankTransactionLogsDto } from 'src/dto/SearcrBankTransactionLogs.dto';

@Injectable()
export class SearchService {
  constructor(private readonly esService: EsService) {}

  async searchMonthlyStat(target: string): Promise<SearchMonthlyStatDto> {
    const endDate = dayjs(target).endOf('month');
    const startDate = dayjs(target).startOf('month');

    const calendarArray: DailyStat[] = [
      ...Array.from({ length: endDate.date() }, (_, i) => {
        const result: DailyStat = {
          date: `${endDate.format('YYYY-MM')}-${String(i + 1).padStart(2, '0')}`,
          card: 0,
          expense: 0,
          income: 0,
        };

        return result;
      }),
    ];

    const accountRes = await this.esService.searchMonthlyAccountStats(
      startDate.format('YYYY-MM-DD'),
      endDate.format('YYYY-MM-DD'),
    );

    accountRes.aggregations.daily_transactions.buckets.forEach((bucket) => {
      const key = dayjs(bucket.key_as_string).format('YYYY-MM-DD');

      const existingStat = calendarArray.find((stat) => stat.date === key);

      bucket.transaction_types.buckets.forEach((transactionType) => {
        if (transactionType.key === 'EXPENSE') {
          existingStat.expense = transactionType.total_amount.value;
        } else {
          existingStat.income = transactionType.total_amount.value;
        }
      });
    });

    const expense = accountRes.aggregations.expense_sum.total_expense.value;
    const income = accountRes.aggregations.income_sum.total_income.value;

    const cardRes = await this.esService.searchMonthlyCardStats(
      startDate.format('YYYY-MM-DD'),
      endDate.format('YYYY-MM-DD'),
    );

    cardRes.aggregations.daily_transactions.buckets.forEach((bucket) => {
      const key = dayjs(bucket.key_as_string).format('YYYY-MM-DD');

      const existingStat = calendarArray.find((stat) => stat.date === key);

      existingStat.card = bucket.total_amount.value;
    });

    const cardTotal = cardRes.aggregations.total_amount.value;

    const result: SearchMonthlyStatDto = {
      dailyStats: calendarArray,
      expense,
      income,
      card: cardTotal,
      balance: income - expense,
    };

    return result;
  }

  async searchDetailCardStats(req: SearchDetailStatsDto): Promise<SearchCardTransactionLogsDto> {
    const res = await this.esService.searchDetailCardStats(req);

    const result: SearchCardTransactionLogsDto = {
      history: res.hits.hits.map((hit) => hit._source),
      full_amount: res.aggregations.full_sum.total_amount.value,
      installments_amount: res.aggregations.installment_sum.total_amount.value,
      total_amount: res.aggregations.total_sum.value,
      total_count: res.hits.total.value,
    };

    return result;
  }

  async searchDetailBankStats(req: SearchDetailStatsDto): Promise<SearchBankTransactionLogsDto> {
    const res = await this.esService.searchDetailAccountStats(req);

    const result: SearchBankTransactionLogsDto = {
      history: res.hits.hits.map((hit) => hit._source),
      income_amount: res.aggregations.income_sum.total_amount.value,
      expense_amount: res.aggregations.expense_sum.total_amount.value,
      total_amount: res.aggregations.total_sum.value,
      total_count: res.hits.total.value,
    };

    return result;
  }
}
