import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async validate(payload: any) {
    const { sub, exp } = payload;

    if (TimeUtil.isExpired(exp)) {
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
