import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ResponseService {
  success(res: Response, message: string, data: any = null) {
    return res.status(200).json({
      success: true,
      message: message,
      data: data,
    });
  }

  error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors: any = null,
  ) {
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

  internalServerError(res: Response, message: string, errors: any = null) {
    return this.error(res, message, 500, errors);
  }
}
