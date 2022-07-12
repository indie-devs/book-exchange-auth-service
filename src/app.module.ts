import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

import { LoggerModule } from 'src/logger/logger.module';
import { LoggerMiddleware } from 'src/logger/logger.middleware';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [LoggerModule, ConfigModule.forRoot()],
  providers: [PrismaService, AppConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
