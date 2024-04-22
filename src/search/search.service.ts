import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticSearchIndex } from 'src/dto/ElasticSearchIndex.enum';

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
}
