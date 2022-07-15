import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'src/app.module';
import { AppConfigService } from 'src/config/app-config.service';
import { HttpExceptionFilter } from 'src/error/http-exception.filter';
import { AppLoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const appConfigService = app.get(AppConfigService);

  const prismaSerivce = app.get(PrismaService);
  prismaSerivce.$connect();

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const port = appConfigService.port;

  setupSwagger(app);

  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`, 'Bootstrap');
  });

  await prismaSerivce.enableShutdownHooks(app);
}
bootstrap();

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Book auth example')
    .setDescription('The book auth API description')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
