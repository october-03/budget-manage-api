import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CardTransactionLog } from 'src/entity/card/CardTransactionLog.entity';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(index: string, keyword: string): Promise<CardTransactionLog[]> {
    const res = await this.elasticsearchService.search<CardTransactionLog>({
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
}
