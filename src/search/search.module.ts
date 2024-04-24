import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EsService } from './es.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'http://elasticsearch:9200',
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        sniffOnStart: true,
        auth: {
          username: 'elastic',
          password: 'elastic',
        },
      }),
    }),
  ],
  providers: [SearchService, EsService],
  exports: [SearchService],
})
export class SearchModule {}
