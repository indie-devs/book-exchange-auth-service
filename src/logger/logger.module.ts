import { Module } from '@nestjs/common';
import { MyLogger } from 'src/logger/logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
