import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticSearchIndex } from 'src/dto/ElasticSearchIndex.enum';
import { SearchDetailCardStatsDto } from 'src/dto/SearchDetailCardStats.dto';
import { CardTransactionLog } from 'src/entity/card/CardTransactionLog.entity';

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

  async searchDetailCardStats(req: SearchDetailCardStatsDto): Promise<SearchTransactionLogsResponse> {
    const queryConditions = [];

    if (req.searchKeyword) {
      queryConditions.push(`description:${req.searchKeyword}`);
    }

    if (req.transaction_type) {
      queryConditions.push(`payment_type:${req.transaction_type}`);
    }

    if (req.card_id) {
      queryConditions.push(`card_id:${req.card_id}`);
    }

    const queryString = queryConditions.join(' AND ');

    const query: QueryDslContainer[] = [{ range: { transaction_date: { gte: req.startDate, lte: req.endDate } } }];

    if (queryString) {
      query.push({ query_string: { query: queryString, fields: ['description', 'payment_type', 'card_id'] } });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const searchRes: SearchTransactionLogsResponse = await this.elasticsearchService.search<CardTransactionLog>({
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
                'payment_type.keyword': 'FULL',
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
                'payment_type.keyword': 'INSTALLMENTS',
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

interface SearchTransactionLogsResponse {
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
