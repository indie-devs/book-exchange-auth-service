import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserAuthDto, RegisterUserAuthDto } from 'src/auth/auth.dto';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
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
    private readonly bryptService: BcryptService,
  ) {}

  async login(credentials: LoginUserAuthDto): Promise<string> {
    const user = await this.prismaService.userAuth.findFirst({
      where: {
        email: credentials.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.bryptService.compare(
      credentials.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.email,
      data: user,
    });

    return accessToken;
  }

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
      this.appConfig.redisConfig.ex,
    );

    return verifyToken;
  }

  async verify(verifyToken: string): Promise<boolean> {
    const key = `verifyToken:${verifyToken}`;

    const token = await this.redisService.client.get(key);

    if (token !== verifyToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const payload = this.jwtService.verify(verifyToken);

    if (payload.exp < TimeUtil.toUnix(new Date())) {
      throw new UnauthorizedException('Token expired');
    }

    const hash = await this.bryptService.hash(payload.data.password);

    await this.prismaService.userAuth.create({
      data: {
        email: payload.data.email,
        password: hash,
      },
    });

    await this.redisService.client.del(key);

    return true;
  }
}
