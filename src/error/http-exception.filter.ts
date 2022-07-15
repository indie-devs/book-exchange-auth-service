import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const error =
      exception instanceof HttpException
        ? exception.getResponse()
        : filterExceptionByStatus(status);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error,
    });
  }
}

function filterExceptionByStatus(status: number): HttpException {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return new BadRequestException();
    case HttpStatus.UNAUTHORIZED:
      return new UnauthorizedException();
    case HttpStatus.FORBIDDEN:
      return new ForbiddenException();
    case HttpStatus.NOT_FOUND:
      return new NotFoundException();

    default:
      return new InternalServerErrorException();
  }
}
