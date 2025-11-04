import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const method = request.method;
    const endpoint = request.route?.path || request.url;
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent') || '';

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Metrics 기록
          this.metricsService.recordRequest(
            endpoint,
            method,
            responseTime,
            true,
          );

          // 응답 시간 로깅
          this.logResponseTime(
            method,
            endpoint,
            statusCode,
            responseTime,
            ip,
            userAgent,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Metrics 기록
          this.metricsService.recordRequest(
            endpoint,
            method,
            responseTime,
            false,
          );

          // 에러 응답 시간 로깅
          this.logResponseTime(
            method,
            endpoint,
            statusCode,
            responseTime,
            ip,
            userAgent,
            error.message,
          );
        },
      }),
    );
  }

  private logResponseTime(
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    ip: string,
    userAgent: string,
    errorMessage?: string,
  ) {
    const logMessage = `${method} ${endpoint} - Status: ${statusCode} - Response Time: ${responseTime}ms - IP: ${ip}`;

    // 응답 시간에 따른 로그 레벨 설정
    if (errorMessage) {
      this.logger.error(`${logMessage} - Error: ${errorMessage}`);
    } else if (responseTime > 3000) {
      // 3초 이상
      this.logger.warn(`[SLOW RESPONSE] ${logMessage}`);
    } else if (responseTime > 1000) {
      // 1초 이상
      this.logger.log(`[MODERATE] ${logMessage}`);
    } else {
      this.logger.log(logMessage);
    }

    // User Agent 상세 로깅 (verbose 레벨)
    if (responseTime > 3000 || errorMessage) {
      this.logger.verbose(`User-Agent: ${userAgent}`);
    }
  }
}
