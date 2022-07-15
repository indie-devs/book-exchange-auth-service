import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigService } from 'src/config/app-config.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [AppConfigService, ConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
