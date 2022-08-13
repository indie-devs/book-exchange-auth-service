/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { AuthService } from 'src/user_auth/auth.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { AppConfigService } from 'src/config/app-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import TimeUtil from 'src/utils/time/time';

const MockRedisService = {
  client: {},
};
const MockPrismaService = {
  userAuth: {},
};
const MockJwtService = {};
const MockAppConfigService = {
  redisConfig: {
    ex: 600,
  },
};

describe('auth.service.spec.ts', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let redisService: RedisService;
  let bcryptService: BcryptService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        BcryptService,
        {
          provide: RedisService,
          useValue: MockRedisService,
        },
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
        {
          provide: JwtService,
          useValue: MockJwtService,
        },
        {
          provide: AppConfigService,
          useValue: MockAppConfigService,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
    bcryptService = module.get(BcryptService);
  });
  describe('login', () => {
    it('Should return access token', async () => {
      const token = 'access_token';

      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };
      prismaService.userAuth.findFirst = jest.fn().mockImplementation(() => {
        return data;
      });

      bcryptService.isEqual = jest.fn().mockImplementation(() => {
        return true;
      });

      jwtService.sign = jest.fn().mockImplementation(() => {
        return token;
      });

      const result = await authService.login(data);

      expect(result).toEqual({
        access_token: token,
      });

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: data.email,
        data,
      });
      expect(bcryptService.isEqual).toHaveBeenCalledWith(
        data.password,
        data.password,
      );
    });

    it('Should throw error if not found auth user', async () => {
      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      const error = new Error('Invalid credentials');
      prismaService.userAuth.findFirst = jest.fn().mockImplementation(() => {
        return data;
      });
      await expect(authService.login(data)).rejects.toThrowError(error);

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
    });

    it('Should throw error if not match password and hash value', async () => {
      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      const error = new Error('Invalid credentials');
      prismaService.userAuth.findFirst = jest.fn().mockImplementation(() => {
        return data;
      });

      bcryptService.isEqual = jest.fn().mockImplementation(() => {
        return false;
      });
      await expect(authService.login(data)).rejects.toThrowError(error);

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });

      expect(bcryptService.isEqual).toHaveBeenCalledWith(
        data.password,
        data.password,
      );
    });

    it('Should throw error if PrismaService throw error ', async () => {
      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      const error = new Error('Prisma Error');
      prismaService.userAuth.findFirst = jest.fn().mockRejectedValue(error);

      await expect(authService.login(data)).rejects.toThrowError(error);

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
    });
  });

  describe('register', () => {
    it('Should return verify token', async () => {
      const token = 'verifyToken';
      prismaService.userAuth.findFirst = jest.fn().mockImplementation(() => {
        return null;
      });
      jwtService.sign = jest.fn().mockImplementation(() => {
        return token;
      });

      redisService.client.set = jest.fn();

      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      const result = await authService.register(data);

      expect(result).toEqual(token);

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: data.email,
        data,
      });
      expect(redisService.client.set).toHaveBeenCalledWith(
        `verifyToken:${token}`,
        token,
        'EX',
        600,
      );
    });

    it('Should throw error if exists email', async () => {
      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      prismaService.userAuth.findFirst = jest.fn().mockImplementation(() => {
        return { email: data.email };
      });

      await expect(authService.register(data)).rejects.toThrowError(
        'Email already exists',
      );

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
    });

    it('Should throw error if PrismaService throw error ', async () => {
      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      const error = new Error('Prisma Error');
      prismaService.userAuth.findFirst = jest.fn().mockRejectedValue(error);

      await expect(authService.register(data)).rejects.toThrowError(error);

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
    });

    it('Should throw error if RedisService throw error', async () => {
      const token = 'verifyToken';
      prismaService.userAuth.findFirst = jest.fn().mockImplementation(() => {
        return null;
      });
      jwtService.sign = jest.fn().mockImplementation(() => {
        return token;
      });

      const error = new Error('JwtService Error');

      redisService.client.set = jest.fn().mockRejectedValue(error);

      const data = {
        email: 'example@gmail.com',
        password: '123456',
      };

      await expect(authService.register(data)).rejects.toThrowError(error);

      expect(prismaService.userAuth.findFirst).toHaveBeenCalledWith({
        where: { email: data.email },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: data.email,
        data,
      });
      expect(redisService.client.set).toHaveBeenCalledWith(
        `verifyToken:${token}`,
        token,
        'EX',
        600,
      );
    });
  });

  describe('verifyRegister', () => {
    it('Should return verify token', async () => {
      const token = 'verifyToken';

      const payload = {
        sub: 'example@gmail.com',
        exp: TimeUtil.toUnix(new Date()) + 600,
        data: {
          email: 'example@gmail.com',
          password: '123456',
        },
      };
      prismaService.userAuth.create = jest.fn();
      bcryptService.hashString = jest.fn().mockImplementation(() => {
        return 'hashValue';
      });

      jwtService.verify = jest.fn().mockImplementation(() => {
        return payload;
      });

      redisService.client.get = jest.fn().mockImplementation(() => {
        return token;
      });
      redisService.client.del = jest.fn();

      const result = await authService.verifyRegister(token);

      expect(result).toEqual(true);

      expect(prismaService.userAuth.create).toHaveBeenCalledWith({
        data: {
          email: payload.data.email,
          password: 'hashValue',
          roles: ['USER'],
        },
      });

      expect(redisService.client.get).toHaveBeenCalledWith(
        `verifyToken:${token}`,
      );

      expect(redisService.client.del).toHaveBeenCalledWith(
        `verifyToken:${token}`,
      );
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(bcryptService.hashString).toHaveBeenCalledWith(
        payload.data.password,
      );
    });

    it('Should throw invalid token error when redis client return wrong token', async () => {
      const token = 'verifyToken';

      const payload = {
        sub: 'example@gmail.com',
        exp: TimeUtil.toUnix(new Date()) + 600,
        data: {
          email: 'example@gmail.com',
          password: '123456',
        },
      };

      redisService.client.get = jest.fn().mockImplementation(() => {
        return 'wrongToken';
      });

      await expect(authService.verifyRegister(token)).rejects.toThrowError(
        'Invalid token',
      );

      expect(redisService.client.get).toHaveBeenCalledWith(
        `verifyToken:${token}`,
      );
    });

    it('Should throw token expired error when token expired', async () => {
      const token = 'verifyToken';

      const payload = {
        sub: 'example@gmail.com',
        exp: TimeUtil.toUnix(new Date()) - 10,
        data: {
          email: 'example@gmail.com',
          password: '123456',
        },
      };
      jwtService.verify = jest.fn().mockImplementation(() => {
        return payload;
      });

      redisService.client.get = jest.fn().mockImplementation(() => {
        return token;
      });

      await expect(authService.verifyRegister(token)).rejects.toThrowError(
        'Token expired',
      );

      expect(redisService.client.get).toHaveBeenCalledWith(
        `verifyToken:${token}`,
      );
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('Should throw error when RedisService throw error', async () => {
      const token = 'verifyToken';
      const error = new Error('RedisService Error');
      redisService.client.get = jest.fn().mockRejectedValue(error);

      await expect(authService.verifyRegister(token)).rejects.toThrowError(
        error,
      );

      expect(redisService.client.get).toHaveBeenCalledWith(
        `verifyToken:${token}`,
      );
    });

    it('Should throw error when PrismaService throw error', async () => {
      const token = 'verifyToken';
      const error = new Error('PrismaService Error');
      const payload = {
        sub: 'example@gmail.com',
        exp: TimeUtil.toUnix(new Date()),
        data: {
          email: 'example@gmail.com',
          password: '123456',
        },
      };
      redisService.client.get = jest.fn().mockImplementation(() => {
        return token;
      });

      jwtService.verify = jest.fn().mockImplementation(() => {
        return payload;
      });

      prismaService.userAuth.create = jest.fn().mockRejectedValue(error);

      await expect(authService.verifyRegister(token)).rejects.toThrowError(
        error,
      );
    });
  });
});
