import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RegisterUserAuthDto } from 'src/auth/auth.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async verify(@Param('token') token: string) {
    const isVerified = await this.authService.verify(token);
    if (!isVerified) {
      throw new UnauthorizedException();
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
}
