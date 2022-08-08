/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';

import { AuthController } from 'src/user_auth/auth.controller';
import {
  LoginUserAuthReqDto,
  RegisterUserAuthDto,
} from 'src/user_auth/auth.dto';
import { AuthService } from 'src/user_auth/auth.service';
import { AppConfigService } from 'src/config/app-config.service';

const MockAuthService = {};
const MockAppConfigService = {};

describe('auth.controller.spec.ts', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: MockAuthService },
        {
          provide: AppConfigService,
          useValue: MockAppConfigService,
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('Should return access token', async () => {
      const token = {
        access_token: 'access_token',
      };

      authService.login = jest
        .fn()
        .mockImplementation((data: LoginUserAuthReqDto) => {
          return token;
        });

      const form: LoginUserAuthReqDto = {
        email: 'example@gmail.com',
        password: '123456',
      };
      const result = await authController.login(form);

      expect(result).toEqual({
        statusCode: 200,
        message: 'success',
        data: token,
      });
      expect(jest.spyOn(authService, 'login')).toHaveBeenCalledWith(form);
    });

    it('Should throw error when AuthSerivce throw error', async () => {
      const error = new Error('AuthService error');
      authService.login = jest.fn().mockRejectedValue(error);
      const form: LoginUserAuthReqDto = {
        email: 'example@gmail.com',
        password: '123456',
      };

      await expect(authController.login(form)).rejects.toThrowError(error);
      expect(jest.spyOn(authService, 'login')).toHaveBeenCalledWith(form);
    });
  });

  describe('register', () => {
    it('Should return verify token', async () => {
      authService.register = jest
        .fn()
        .mockImplementation((data: RegisterUserAuthDto) => {
          return 'verifyToken';
        });

      const form: RegisterUserAuthDto = {
        email: 'example@gmail.com',
        password: '123456',
      };
      const result = await authController.register(form);

      expect(result).toEqual({
        statusCode: 200,
        message: 'success',
        data: { verify_token: 'verifyToken' },
      });
      expect(jest.spyOn(authService, 'register')).toHaveBeenCalledWith(form);
    });

    it('Should throw error when AuthSerivce throw error', async () => {
      const error = new Error('AuthService error');
      authService.register = jest.fn().mockRejectedValue(error);
      const form: RegisterUserAuthDto = {
        email: 'example@gmail.com',
        password: '123456',
      };

      await expect(authController.register(form)).rejects.toThrowError(error);
      expect(jest.spyOn(authService, 'register')).toHaveBeenCalledWith(form);
    });
  });

  describe('verifyRegister', () => {
    it('Should return True value', async () => {
      authService.verifyRegister = jest
        .fn()
        .mockImplementation((token: string) => {
          return true;
        });

      const token = 'verifyToken';
      const result = await authController.verifyRegister(token);

      expect(result).toEqual({ statusCode: 200, message: 'success' });
      expect(jest.spyOn(authService, 'verifyRegister')).toHaveBeenCalledWith(
        token,
      );
    });

    it('Should throw error when AuthSerivce throw error', async () => {
      const error = new Error('AuthService error');
      const token = 'verifyToken';

      authService.verifyRegister = jest.fn().mockRejectedValue(error);

      await expect(authController.verifyRegister(token)).rejects.toThrowError(
        error,
      );
      expect(jest.spyOn(authService, 'verifyRegister')).toHaveBeenCalledWith(
        token,
      );
    });
  });
});
