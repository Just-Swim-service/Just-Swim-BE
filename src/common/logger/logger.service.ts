import { LoggerService } from '@nestjs/common';

export class MyLogger implements LoggerService {
  debug(message: any, ...optionalParams: any[]) {
    console.debug(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }
}
