import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUserResDto } from 'src/user_auth/auth.dto';
import { AppConfigService } from 'src/config/app-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import TimeUtil from 'src/utils/time/time';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwtSecret,
    });
  }

  async validate(payload: any): Promise<JwtUserResDto> {
    const { sub, exp } = payload;

    if (TimeUtil.expiredTimestamp(exp)) {
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.prismaService.userAuth.findFirst({
      where: {
        email: sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    delete user.password;

    return user;
  }
}
