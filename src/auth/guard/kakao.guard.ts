import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  constructor() {
    super(); // Guard의 super를 통해 kakao 소셜로그인으로 접근
  }
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // 에러
    if (err || !user) {
      throw err;
    }
    return user;
  }
}
