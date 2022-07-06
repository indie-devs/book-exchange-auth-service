import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configKeys } from './constants';
import { MyLogger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(MyLogger);
  const configService = app.get(ConfigService);

  const port = configService.get(configKeys.AUTH_PORT) || 3001;

  app.useLogger(logger);

  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`, 'Bootstrap');
  });
}
bootstrap();
