import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserAuthDto } from 'src/auth/auth.dto';
import { AppConfigService } from 'src/config/app-config.service';
import { AppLoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import TimeUtil from 'src/utils/time/time';

@Injectable()
export class AuthService {
  private readonly logger = new AppLoggerService(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
  ) {}

  async register(user: RegisterUserAuthDto): Promise<string> {
    const isExists = await this.prismaService.userAuth.findFirst({
      where: {
        email: user.email,
      },
    });

    if (isExists) {
      throw new ConflictException('Email already exists');
    }

    const verifyToken = this.jwtService.sign({
      sub: user.email,
      data: {
        email: user.email,
        password: user.password,
      },
    });

    await this.redisService.client.set(
      'verifyToken:' + verifyToken,
      verifyToken,
      'EX',
      this.appConfig.JwtExpiration,
    );

    return verifyToken;
  }

  async verify(verifyToken: string): Promise<boolean> {
    const key = `verifyToken:${verifyToken}`;

    const token = await this.redisService.client.get(key);

    if (token !== verifyToken) {
      return false;
    }

    const payload = this.jwtService.verify(verifyToken);

    if (payload.exp < TimeUtil.toUnix(new Date())) {
      return false;
    }

    await this.prismaService.userAuth.create({
      data: payload.data,
    });

    await this.redisService.client.del(key);

    return true;
  }
}
