import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticSearchIndex } from 'src/dto/ElasticSearchIndex.enum';
import * as dayjs from 'dayjs';
import { DailyStat, SearchMonthlyStatDto } from 'src/dto/SearchMonthlyAccountStat.dto';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search<T>(index: ElasticSearchIndex, keyword: string): Promise<T[]> {
    const res = await this.elasticsearchService.search<T>({
      index: index,
      body: {
        query: {
          query_string: {
            query: keyword,
          },
        },
      },
    });

    return res.hits.hits.map((hit) => hit._source);
  }

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

    const accountRes = await this.searchMonthlyAccountStats(
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

    const cardRes = await this.searchMonthlyCardStats(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));

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
      balance: income - expense - cardTotal,
    };

    return result;
  }

  async searchMonthlyAccountStats(startDate: string, endDate: string): Promise<SearchMonthlyAccountStatsResponse> {
    const searchRes: SearchMonthlyAccountStatsResponse = await this.elasticsearchService.search({
      index: ElasticSearchIndex.BANK_TRANSACTION,
      body: {
        query: {
          range: {
            transaction_date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        aggs: {
          daily_transactions: {
            date_histogram: {
              field: 'transaction_date',
              calendar_interval: 'day',
            },
            aggs: {
              transaction_types: {
                terms: {
                  field: 'transaction_type.keyword',
                },
                aggs: {
                  total_amount: {
                    sum: {
                      field: 'amount',
                    },
                  },
                },
              },
            },
          },
          expense_sum: {
            filter: {
              term: {
                'transaction_type.keyword': 'EXPENSE',
              },
            },
            aggs: {
              total_expense: {
                sum: {
                  field: 'amount',
                },
              },
            },
          },
          income_sum: {
            filter: {
              term: {
                'transaction_type.keyword': 'INCOME',
              },
            },
            aggs: {
              total_income: {
                sum: {
                  field: 'amount',
                },
              },
            },
          },
        },
      },
    });

    return searchRes;
  }

  async searchMonthlyCardStats(startDate: string, endDate: string): Promise<SearchMonthlyCardStatsResponse> {
    const searchRes: SearchMonthlyCardStatsResponse = await this.elasticsearchService.search({
      index: ElasticSearchIndex.CARD_TRANSACTION,
      body: {
        query: {
          range: {
            transaction_date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        aggs: {
          daily_transactions: {
            date_histogram: {
              field: 'transaction_date',
              calendar_interval: 'day',
            },
            aggs: {
              total_amount: {
                sum: {
                  field: 'amount',
                },
              },
            },
          },
          total_amount: {
            sum: {
              field: 'amount',
            },
          },
        },
      },
    });

    return searchRes;
  }
}

interface SearchMonthlyAccountStatsResponse {
  aggregations?: {
    daily_transactions: {
      buckets: {
        key_as_string: string;
        key: number;
        doc_count: number;
        transaction_types: {
          doc_count_error_upper_bound: number;
          sum_other_doc_count: number;
          buckets: {
            key: string;
            doc_count: number;
            total_amount: {
              value: number;
            };
          }[];
        };
      }[];
    };
    expense_sum: {
      doc_count: number;
      total_expense: {
        value: number;
      };
    };
    income_sum: {
      doc_count: number;
      total_income: {
        value: number;
      };
    };
  };
}

interface SearchMonthlyCardStatsResponse {
  aggregations?: {
    daily_transactions: {
      buckets: {
        key_as_string: string;
        key: number;
        doc_count: number;
        total_amount: {
          value: number;
        };
      }[];
    };
    total_amount: {
      value: number;
    };
  };
}
