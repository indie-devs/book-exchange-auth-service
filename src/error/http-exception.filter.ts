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
        : filterExceptionByStatus(status, exception['message']);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error,
    });
  }
}

function filterExceptionByStatus(
  status: number,
  message: string,
): HttpException {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return new BadRequestException(message);
    case HttpStatus.UNAUTHORIZED:
      return new UnauthorizedException(message);
    case HttpStatus.FORBIDDEN:
      return new ForbiddenException(message);
    case HttpStatus.NOT_FOUND:
      return new NotFoundException(message);

    default:
      return new InternalServerErrorException(message);
  }
}
