import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from 'src/config/app-config.service';
import { AppLoggerService } from 'src/logger/logger.service';

@Injectable()
export class RedisService {
  client: Redis;
  private logger: AppLoggerService;
  constructor(private readonly appConfig: AppConfigService) {
    this.logger = new AppLoggerService(RedisService.name);

    this.client = new Redis({
      host: this.appConfig.redisConfig.host,
      port: this.appConfig.redisConfig.port,
      db: this.appConfig.redisConfig.db,
      password: this.appConfig.redisConfig.password,
    });

    this.logger.log(`Redis connected`);
  }

  async close() {
    this.client.quit();
  }
}
