import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginUserAuthReqDto, RegisterUserAuthDto } from 'src/auth/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Injectable()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({
    type: LoginUserAuthReqDto,
    examples: {
      empty_body: {
        value: {} as LoginUserAuthReqDto,
      },
      valid_body: {
        value: {
          email: 'example@gmail.com',
          password: '123456',
        } as LoginUserAuthReqDto,
      },
    },
  })
  async login(@Body() body: LoginUserAuthReqDto) {
    const token = await this.authService.login(body);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
      data: token,
    };
  }

  @Post('register')
  @ApiBody({
    type: RegisterUserAuthDto,
    examples: {
      empty_body: {
        value: {} as RegisterUserAuthDto,
      },
      valid_body: {
        value: {
          email: 'example@gmail.com',
          password: '123456',
        } as RegisterUserAuthDto,
      },
    },
  })
  async register(@Body() body: RegisterUserAuthDto) {
    const token = await this.authService.register(body);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
      data: {
        verify_token: token,
      },
    };
  }

  @Get('register/verify/:token')
  async verifyRegister(@Param('token') token: string) {
    const isVerified = await this.authService.verifyRegister(token);
    if (!isVerified) {
      throw new UnauthorizedException();
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verify(@Request() req, @Response() res) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    res.set('x-user-id', req.user.id);
    if (req.user.roles.includes('ADMIN')) {
      res.set('x-is-admin', true);
    }
    res.json({
      statusCode: HttpStatus.OK,
      message: 'success',
    });
  }
}
