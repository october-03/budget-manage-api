import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EsService } from './es.service';
import { SearchController } from './search.controller';
import { CardModule } from 'src/card/card.module';
import { AccountModule } from 'src/account/account.module';

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
    CardModule,
    AccountModule,
  ],
  providers: [SearchService, EsService],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
