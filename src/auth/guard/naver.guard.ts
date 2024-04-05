import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class NaverAuthGuard extends AuthGuard('naver') {
  constructor() {
    super();
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
