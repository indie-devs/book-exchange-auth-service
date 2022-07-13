import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app-config.module';

import { LoggerMiddleware } from 'src/logger/logger.middleware';
import { LoggerModule } from 'src/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [LoggerModule, AppConfigModule, RedisModule, PrismaModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
