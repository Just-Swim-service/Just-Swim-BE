import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponseDto } from '../dto/common-response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, CommonResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CommonResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 CommonResponseDto 형태인 경우 그대로 반환
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 기본 성공 응답 형태로 변환
        return {
          success: true,
          message: '요청이 성공적으로 처리되었습니다.',
          data: data,
        };
      }),
    );
  }
}
