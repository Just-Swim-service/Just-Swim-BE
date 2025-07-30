import * as dotenv from 'dotenv';
dotenv.config();

import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as AWS from 'aws-sdk';

const accessKeyId = process.env.AWS_S3_ACCESS_KEY!;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY!;
const region = process.env.AWS_REGION!;

const cloudWatchLogs = new AWS.CloudWatchLogs({
  accessKeyId,
  secretAccessKey,
  region,
});

export class MyLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] [${level.toUpperCase()}] ${message}`,
        ),
      ),
      transports: [
        new winston.transports.Console(),
        new WinstonCloudWatch({
          logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
          logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
          cloudWatchLogs: cloudWatchLogs as unknown as any,
          jsonMessage: false,
        }),
      ],
    });
  }

  log(message: string, ...optionalParams: any[]) {
    this.logger.info(this.format(message, optionalParams));
  }

  error(message: string, ...optionalParams: any[]) {
    this.logger.error(this.format(message, optionalParams));
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(this.format(message, optionalParams));
  }

  debug?(message: string, ...optionalParams: any[]) {
    this.logger.debug(this.format(message, optionalParams));
  }

  private format(message: string, params: any[]) {
    if (!params.length) return message;

    // 민감한 데이터 필터링
    const sanitizedParams = this.sanitizeSensitiveData(params);
    return `${message} | ${JSON.stringify(sanitizedParams)}`;
  }

  private sanitizeSensitiveData(data: any[]): any[] {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'refreshToken',
      'phoneNumber',
      'birth',
      'email',
      'accessToken',
    ];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some((field) =>
          lowerKey.includes(field.toLowerCase()),
        );

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return data.map(sanitize);
  }
}
