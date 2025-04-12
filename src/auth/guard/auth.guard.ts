import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 요청에서 user 객체가 존재하는지 확인한다.
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      return false;
    }

    return true;
  }
}
