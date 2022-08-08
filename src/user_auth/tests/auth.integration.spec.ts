import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';
import { LoggerModule } from 'src/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { AuthController } from 'src/user_auth/auth.controller';
import { AuthService } from 'src/user_auth/auth.service';
import { JwtStrategy } from 'src/user_auth/jwt.strategy';

describe('auth.integration.spec.ts', () => {
  let prismaService: PrismaService;
  let authController: AuthController;
  let redisService: RedisService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        LoggerModule,
        RedisModule,
        PrismaModule,
        AppConfigModule,
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
      controllers: [AuthController],
      providers: [
        BcryptService,
        JwtStrategy,
        {
          provide: AuthService,
          useClass: AuthService,
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
  });

  beforeEach(async () => {
    await prismaService.seedDatabase();
  });

  afterEach(async () => {
    await prismaService.dropDatabase();
  });

  afterAll(async () => {
    await prismaService.close();
    await redisService.close();
  });

  describe('login', () => {
    it('Should return access token', async () => {
      const form = {
        email: 'user1@gmail.com',
        password: '123456',
      };

      const res = await authController.login(form);

      expect(res.data.access_token).toBeDefined();
      expect(res.statusCode).toBe(200);
      expect(res.message).toBe('success');
    });

    it('Should throw error when wrong email', async () => {
      const error = new Error('Invalid credentials');

      const form = {
        email: 'wrong@email.com',
        password: '123456',
      };

      await expect(authController.login(form)).rejects.toThrowError(error);
    });

    it('Should throw error when wrong password', async () => {
      const error = new Error('Invalid credentials');

      const form = {
        email: 'user1@email.com',
        password: 'wrong password',
      };

      await expect(authController.login(form)).rejects.toThrowError(error);
    });
  });

  describe('register', () => {
    it('Should return verify token', async () => {
      const form = {
        email: 'user3@gmail.com',
        password: '123456',
      };

      const res = await authController.register(form);

      expect(res.data.verify_token).toBeDefined();
      expect(res.statusCode).toBe(200);
      expect(res.message).toBe('success');

      const token = await redisService.client.get(
        `verifyToken:${res.data.verify_token}`,
      );
      expect(token).toBeTruthy();
    });

    it('Should throw error when email already exists', async () => {
      const error = new Error('Email already exists');

      const form = {
        email: 'user1@gmail.com',
        password: '123456',
      };

      await expect(authController.register(form)).rejects.toThrowError(error);
    });
  });

  describe('verifyRegister', () => {
    it('Should create new user_auth', async () => {
      const form = {
        email: 'user3@gmail.com',
        password: '123456',
      };

      const resRegister = await authController.register(form);

      const verifyToken = await redisService.client.get(
        `verifyToken:${resRegister.data.verify_token}`,
      );

      expect(verifyToken).toBeTruthy();

      const resVerify = await authController.verifyRegister(verifyToken);

      expect(resVerify.statusCode).toBe(200);

      const userAuth = await prismaService.userAuth.findFirst({
        where: { email: form.email },
      });
      expect(userAuth).toBeTruthy();
      expect(userAuth.isAdmin).toBe(false);
      expect(userAuth.roles).toEqual(['USER']);
    });

    it('Should throw error when wrong token', async () => {
      const error = new Error('Invalid token');

      expect(authController.verifyRegister('wrong token')).rejects.toThrowError(
        error,
      );
    });
  });
});
