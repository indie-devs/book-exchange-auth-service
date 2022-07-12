import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { AppConfigService } from 'src/config/app-config.service';
import { MyLogger } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);

  const prismaSerivce = app.get(PrismaService);
  prismaSerivce.$connect();

  const logger = app.get(MyLogger);
  app.useLogger(logger);

  const port = appConfigService.port;

  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`, 'Bootstrap');
  });

  await prismaSerivce.enableShutdownHooks(app);
}
bootstrap();
