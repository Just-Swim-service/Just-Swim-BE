import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_VERSION_KEY } from '../decorators/api-version.decorator';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredVersion = this.reflector.getAllAndOverride<string>(
      API_VERSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredVersion) {
      return true; // 버전 요구사항이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const apiVersion = request.headers['api-version'] || 'v1';

    return apiVersion === requiredVersion;
  }
}
