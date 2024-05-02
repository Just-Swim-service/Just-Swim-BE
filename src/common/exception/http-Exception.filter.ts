import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    const req = context.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (typeof error === 'string') {
      res.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        statusCode: status,
        path: req.url,
        error,
      });
    }
    if (typeof error !== 'string') {
      res.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        ...error,
      });
    }

    // logger
    this.logger.error(
      `HTTP 요청에서 예외 발생: ${req.method} ${req.url}`,
      exception.stack,
    );
  }
}
