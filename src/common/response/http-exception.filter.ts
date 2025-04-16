import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MyLogger } from '../logger/logger.service';
import { ResponseService } from './reponse.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: MyLogger,
    private readonly responseService: ResponseService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    const req = context.getRequest<Request>();

    const status = exception.getStatus();
    const error = exception.getResponse();

    const message =
      typeof error === 'string' ? error : (error as any).message || '예외 발생';

    this.logger.error(
      `HTTP 예외 발생: ${req.method} ${req.url} - ${message}`,
      exception.stack,
    );

    return this.responseService.error(res, message, status);
  }
}
