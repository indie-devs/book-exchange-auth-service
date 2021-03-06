import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { AppConfigService } from 'src/config/app-config.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (appConfig: AppConfigService) => ({
        secret: appConfig.jwtSecret,
        signOptions: {
          expiresIn: appConfig.JwtExpiration,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AuthService, BcryptService],
  controllers: [AuthController],
})
export class AuthModule {}
