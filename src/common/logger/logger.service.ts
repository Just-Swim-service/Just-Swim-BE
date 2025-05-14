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
    return params.length ? `${message} | ${JSON.stringify(params)}` : message;
  }
}
