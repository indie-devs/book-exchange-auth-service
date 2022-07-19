import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configKeys } from 'src/config/constants';
import { RedisConfig } from 'src/types';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get JwtExpiration(): number {
    return this.configService.get(configKeys.JWT_EXPIRATION) || 10 * 60 * 1000;
  }

  get port(): number {
    return this.configService.get(configKeys.HTTP_SERVER_PORT) || 3000;
  }

  get jwtSecret(): string {
    return this.configService.get(configKeys.JWT_SECRET);
  }

  get redisConfig(): RedisConfig {
    return {
      host: this.configService.get(configKeys.REDIS_HOST),
      port: this.configService.get(configKeys.REDIS_PORT),
      password: this.configService.get(configKeys.REDIS_PASSWORD),
      db: this.configService.get(configKeys.REDIS_DB),
      ex: this.configService.get(configKeys.REDIS_EX),
    };
  }
}
