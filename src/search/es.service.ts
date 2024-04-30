import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticSearchIndex } from 'src/dto/ElasticSearchIndex.enum';
import { SearchDetailStatsDto } from 'src/dto/SearchDetailStats.dto';
import { BankTransactionLog } from 'src/entity/account/BankTransactionLog.entity';
import { CardTransactionLog } from 'src/entity/card/CardTransactionLog.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class EsService {
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

  async searchMonthlyAccountStats(startDate: string, endDate: string): Promise<SearchMonthlyAccountStatsResponse> {
    const searchRes: SearchMonthlyAccountStatsResponse = await this.elasticsearchService.search({
      index: ElasticSearchIndex.BANK_TRANSACTION,
      body: {
        query: {
          range: {
            transaction_date: {
              gte: dayjs(startDate).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss'),
              lte: dayjs(endDate).set('hour', 23).set('minute', 59).set('second', 59).format('YYYY-MM-DDTHH:mm:ss'),
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
                  field: 'transaction_type',
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
                transaction_type: 'EXPENSE',
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
                transaction_type: 'INCOME',
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
              gte: dayjs(startDate).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss'),
              lte: dayjs(endDate).set('hour', 23).set('minute', 59).set('second', 59).format('YYYY-MM-DDTHH:mm:ss'),
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

  async searchDetailCardStats(req: SearchDetailStatsDto): Promise<SearchPaymentLogsResponse> {
    const queryConditions = [];

    if (req.searchKeyword) {
      queryConditions.push(`description:${req.searchKeyword}`);
    }

    if (req.transaction_type) {
      queryConditions.push(`payment_type:${req.transaction_type}`);
    }

    if (req.id) {
      queryConditions.push(`card_id:${req.id}`);
    }

    const queryString = queryConditions.join(' AND ');

    const query: QueryDslContainer[] = [
      {
        range: {
          transaction_date: {
            gte: dayjs(req.startDate).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss'),
            lte: dayjs(req.endDate).set('hour', 23).set('minute', 59).set('second', 59).format('YYYY-MM-DDTHH:mm:ss'),
          },
        },
      },
    ];

    if (queryString) {
      query.push({ query_string: { query: queryString, fields: ['description', 'payment_type', 'card_id'] } });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const searchRes: SearchPaymentLogsResponse = await this.elasticsearchService.search<CardTransactionLog>({
      index: ElasticSearchIndex.CARD_TRANSACTION,
      body: {
        from: req.page * 10,
        size: 10,
        query: {
          bool: {
            must: query,
          },
        },
        sort: [
          {
            transaction_date: {
              order: 'desc',
            },
          },
        ],
        aggs: {
          full_sum: {
            filter: {
              term: {
                payment_type: 'FULL',
              },
            },
            aggs: {
              total_amount: {
                sum: {
                  field: 'amount',
                },
              },
            },
          },
          installment_sum: {
            filter: {
              term: {
                payment_type: 'INSTALLMENTS',
              },
            },
            aggs: {
              total_amount: {
                sum: {
                  field: 'amount',
                },
              },
            },
          },
          total_sum: {
            sum: {
              field: 'amount',
            },
          },
        },
      },
    });

    return searchRes;
  }

  async searchDetailAccountStats(req: SearchDetailStatsDto): Promise<SearchTransactionLogsResponse> {
    const queryConditions = [];

    if (req.searchKeyword) {
      queryConditions.push(`description:${req.searchKeyword}`);
    }

    if (req.transaction_type) {
      queryConditions.push(`transaction_type:${req.transaction_type}`);
    }

    if (req.id) {
      queryConditions.push(`account_id:${req.id}`);
    }

    const queryString = queryConditions.join(' AND ');

    const query: QueryDslContainer[] = [
      {
        range: {
          transaction_date: {
            gte: dayjs(req.startDate).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss'),
            lte: dayjs(req.endDate).set('hour', 23).set('minute', 59).set('second', 59).format('YYYY-MM-DDTHH:mm:ss'),
          },
        },
      },
    ];

    if (queryString) {
      query.push({ query_string: { query: queryString, fields: ['description', 'transaction_type', 'account_id'] } });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const searchRes: SearchTransactionLogsResponse = await this.elasticsearchService.search<BankTransactionLog>({
      index: ElasticSearchIndex.BANK_TRANSACTION,
      body: {
        from: req.page * 10,
        size: 10,
        query: {
          bool: {
            must: query,
          },
        },
        sort: [
          {
            transaction_date: {
              order: 'desc',
            },
          },
        ],
        aggs: {
          income_sum: {
            filter: {
              term: {
                transaction_type: 'INCOME',
              },
            },
            aggs: {
              total_amount: {
                sum: {
                  field: 'amount',
                },
              },
            },
          },
          expense_sum: {
            filter: {
              term: {
                transaction_type: 'EXPENSE',
              },
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
    });

    return {
      ...searchRes,
      aggregations: {
        ...searchRes.aggregations,
        total_sum: {
          value:
            searchRes.aggregations.income_sum.total_amount.value -
            searchRes.aggregations.expense_sum.total_amount.value,
        },
      },
    };
  }

  async searchCardList(): Promise<SearchAllStatsResponse> {
    const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs().endOf('month').format('YYYY-MM-DD');

    const res: SearchAllStatsResponse = await this.elasticsearchService.search({
      index: ElasticSearchIndex.CARD_TRANSACTION,
      body: {
        query: {
          range: {
            transaction_date: {
              gte: dayjs(startDate).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss'),
              lte: dayjs(endDate).set('hour', 23).set('minute', 59).set('second', 59).format('YYYY-MM-DDTHH:mm:ss'),
            },
          },
        },
        aggs: {
          card_id: {
            terms: {
              field: 'card_id',
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
    });

    return res;
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

interface SearchPaymentLogsResponse {
  hits: {
    total?: {
      value: number;
      relation: string;
    };

    hits: {
      _source?: CardTransactionLog;
    }[];
  };
  aggregations?: {
    full_sum?: {
      doc_count: number;
      total_amount: {
        value: number;
      };
    };
    installment_sum?: {
      doc_count: number;
      total_amount: {
        value: number;
      };
    };
    total_sum?: {
      value: number;
    };
  };
}

interface SearchTransactionLogsResponse {
  hits: {
    total?: {
      value: number;
      relation: string;
    };

    hits: {
      _source?: BankTransactionLog;
    }[];
  };
  aggregations?: {
    income_sum?: {
      doc_count: number;
      total_amount: {
        value: number;
      };
    };
    expense_sum?: {
      doc_count: number;
      total_amount: {
        value: number;
      };
    };
    total_sum?: {
      value: number;
    };
  };
}

interface SearchAllStatsResponse {
  aggregations?: {
    card_id?: {
      doc_count_error_upper_bound: number;
      sum_other_doc_count: number;
      buckets: {
        key: number;
        doc_count: number;
        total_amount: {
          value: number;
        };
      }[];
    };
  };
}

interface QueryDslContainer {
  range?: {
    [key: string]: {
      gte: string;
      lte: string;
    };
  };
  query_string?: {
    query: string;
    fields: string[];
  };
}
