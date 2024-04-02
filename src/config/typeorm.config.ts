import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('POSTGRES_DB_HOST'),
      port: 5432,
      username: this.configService.get('POSTGRES_DB_USER'),
      password: this.configService.get('POSTGRES_DB_PASSWORD'),
      database: this.configService.get('POSTGRES_DB_NAME'),
      // entities: ['src/entity/*.entity.ts'],
      synchronize: true,
      autoLoadEntities: true,
    };
  }
}
