import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MyLogger } from '../logger/logger.service';
import { ResponseService } from './response.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: MyLogger,
    private readonly responseService: ResponseService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    const req = context.getRequest<Request>();

    if (res.headersSent || res.writableEnded) {
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 내부 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const error = exception.getResponse();
      message =
        typeof error === 'string' ? error : (error as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message || message;
      this.logger.error(
        `예상치 못한 오류 발생: ${req.method} ${req.url} - ${message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `알 수 없는 오류 발생: ${req.method} ${req.url}`,
        JSON.stringify(exception),
      );
    }

    // 프로덕션 환경에서는 상세한 에러 정보를 숨김
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorDetails = isDevelopment && exception instanceof Error
      ? { stack: exception.stack }
      : null;

    return this.responseService.error(res, message, status, errorDetails);
  }
}

