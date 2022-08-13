import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from 'src/user_auth/auth.module';
import { AppConfigModule } from 'src/config/app-config.module';

import { LoggerMiddleware } from 'src/logger/logger.middleware';
import { LoggerModule } from 'src/logger/logger.module';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    LoggerModule,
    RedisModule,
    PrismaModule,
    AppConfigModule,
    AuthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
