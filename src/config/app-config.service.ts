import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configKeys } from 'src/config/constants';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get(configKeys.HTTP_SERVER_PORT) || 3000;
  }

  get jwtSecret(): string {
    return this.configService.get(configKeys.JWT_SECRET);
  }
}
