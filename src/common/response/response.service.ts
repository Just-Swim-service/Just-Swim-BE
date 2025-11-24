import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ResponseService {
  success<T = unknown>(res: Response, message: string, data: T | null = null) {
    return res.status(200).json({
      success: true,
      message: message,
      data: data,
    });
  }

  error<T = unknown>(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors: T | null = null,
  ) {
    if (res.headersSent || res.writableEnded) return;
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  unauthorized(res: Response, message: string) {
    return this.error(res, message, 401);
  }

  notFound(res: Response, message: string) {
    return this.error(res, message, 404);
  }

  conflict(res: Response, message: string) {
    return this.error(res, message, 409);
  }

  forbidden(res: Response, message: string) {
    return this.error(res, message, 403);
  }

  badRequest(res: Response, message: string) {
    return this.error(res, message, 400);
  }

  internalServerError<T = unknown>(res: Response, message: string, errors: T | null = null) {
    return this.error(res, message, 500, errors);
  }
}
