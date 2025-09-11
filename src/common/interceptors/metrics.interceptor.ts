import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const method = request.method;
    const endpoint = request.route?.path || request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.metricsService.recordRequest(
            endpoint,
            method,
            responseTime,
            true,
          );
        },
        error: () => {
          const responseTime = Date.now() - startTime;
          this.metricsService.recordRequest(
            endpoint,
            method,
            responseTime,
            false,
          );
        },
      }),
    );
  }
}
