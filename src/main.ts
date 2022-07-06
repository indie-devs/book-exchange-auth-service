import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(MyLogger);
  app.useLogger(logger);
  await app.listen(3000, () => {
    logger.log('Server is running on port 3000', 'Bootstrap');
  });
}
bootstrap();
