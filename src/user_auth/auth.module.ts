import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/user_auth/auth.service';
import { JwtStrategy } from 'src/user_auth/jwt.strategy';
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
  providers: [AuthService, BcryptService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
