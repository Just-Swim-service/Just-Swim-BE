import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from 'src/users/enum/user-type.enum';

export const RequireUserType = (userTypes: UserType[]) =>
  SetMetadata('userTypes', userTypes);

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredUserTypes = this.reflector.get<UserType[]>(
      'userTypes',
      context.getHandler(),
    );

    if (!requiredUserTypes) {
      return true; // No specific user type required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming user is attached by AuthGuard

    if (!user || !user.userType) {
      throw new ForbiddenException('사용자 타입 정보가 없습니다.');
    }

    const hasRequiredType = requiredUserTypes.some(
      (type) => user.userType === type,
    );

    if (!hasRequiredType) {
      throw new ForbiddenException('해당 기능에 접근할 권한이 없습니다.');
    }

    return true;
  }
}


