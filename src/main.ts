import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configKeys } from './constants';
import { PrismaService } from './config/db/prisma.service';
import { MyLogger } from './lib/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const prismaSerivce = app.get(PrismaService);
  prismaSerivce.$connect();

  const logger = app.get(MyLogger);
  app.useLogger(logger);

  const port = configService.get(configKeys.AUTH_PORT) || 3001;

  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`, 'Bootstrap');
  });

  await prismaSerivce.enableShutdownHooks(app);
}
bootstrap();
