import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MyLogger } from '../logger/logger.service';
import { ResponseService } from './response.service';

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

    if (res.headersSent || res.writableEnded) {
      return;
    }

    const status = exception.getStatus();
    const error = exception.getResponse();

    const message =
      typeof error === 'string' ? error : (error as any).message || '예외 발생';

    // 민감한 정보가 포함된 URL이나 메시지 필터링
    const sanitizedUrl = this.sanitizeUrl(req.url);
    const sanitizedMessage = this.sanitizeMessage(message);

    this.logger.error(
      `HTTP 예외 발생: ${req.method} ${sanitizedUrl} - ${sanitizedMessage}`,
      exception.stack,
    );

    return this.responseService.error(res, message, status);
  }

  private sanitizeUrl(url: string): string {
    // URL에서 민감한 정보 제거
    const sensitiveParams = ['token', 'password', 'secret', 'key', 'auth'];
    let sanitizedUrl = url;

    sensitiveParams.forEach((param) => {
      const regex = new RegExp(`[?&]${param}=[^&]*`, 'gi');
      sanitizedUrl = sanitizedUrl.replace(
        regex,
        `[${param.toUpperCase()}_REDACTED]`,
      );
    });

    return sanitizedUrl;
  }

  private sanitizeMessage(message: string): string {
    // 에러 메시지에서 민감한 정보 제거
    const sensitivePatterns = [
      /password[:\s]*[^\s]+/gi,
      /token[:\s]*[^\s]+/gi,
      /secret[:\s]*[^\s]+/gi,
      /key[:\s]*[^\s]+/gi,
      /email[:\s]*[^\s@]+@[^\s@]+\.[^\s@]+/gi,
      /phone[:\s]*[\d-]+/gi,
    ];

    let sanitizedMessage = message;
    sensitivePatterns.forEach((pattern) => {
      sanitizedMessage = sanitizedMessage.replace(
        pattern,
        '[SENSITIVE_DATA_REDACTED]',
      );
    });

    return sanitizedMessage;
  }
}
