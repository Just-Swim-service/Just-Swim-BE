import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { envVariables } from 'src/common/const/env.const';
import { MyLogger } from 'src/common/logger/logger.service';
import { UsersService } from 'src/users/users.service';
import {
  SecurityLoggerService,
  SecurityEventType,
} from 'src/common/security/security-logger.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
    private readonly logger: MyLogger,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const skipAuth = this.reflector.get<boolean>(
      'skipAuth',
      context.getHandler(),
    );
    if (skipAuth) return true;

    const cookieToken = request.cookies.authorization;
    const headerToken = request.headers.authorization;
    const authorization = cookieToken ? `Bearer ${cookieToken}` : headerToken;

    if (!authorization) {
      this.securityLogger.logAuthenticationFailure(
        request,
        'No authorization header provided',
      );
      throw new UnauthorizedException('로그인이 필요한 기능입니다.');
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) {
      this.securityLogger.logAuthenticationFailure(
        request,
        'Invalid authorization format',
        { authorizationType: type },
      );
      throw new UnauthorizedException('잘못된 인증 형식입니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(envVariables.accessTokenSecret),
      });

      // JWT 클레임 검증
      if (payload.iss !== 'https://api.just-swim.kr') {
        this.securityLogger.logTokenEvent(
          request,
          SecurityEventType.INVALID_TOKEN,
          'Invalid token issuer',
          payload.userId,
        );
        throw new UnauthorizedException('잘못된 토큰 발급자입니다.');
      }
      if (payload.aud !== 'https://just-swim.kr') {
        this.securityLogger.logTokenEvent(
          request,
          SecurityEventType.INVALID_TOKEN,
          'Invalid token audience',
          payload.userId,
        );
        throw new UnauthorizedException('잘못된 토큰 대상자입니다.');
      }
      if (!payload.jti || !payload.iat) {
        this.securityLogger.logTokenEvent(
          request,
          SecurityEventType.INVALID_TOKEN,
          'Missing required claims',
          payload.userId,
        );
        throw new UnauthorizedException('토큰에 필수 클레임이 없습니다.');
      }

      // 토큰 발급 시간 검증 (5분 이내)
      const now = Math.floor(Date.now() / 1000);
      if (now - payload.iat > 300) {
        this.securityLogger.logTokenEvent(
          request,
          SecurityEventType.TOKEN_EXPIRED,
          'Token too old',
          payload.userId,
        );
        throw new UnauthorizedException('토큰이 너무 오래되었습니다.');
      }

      const user = await this.usersService.findUserByPk(payload.userId);
      if (!user) {
        this.securityLogger.logAuthenticationFailure(
          request,
          'User not found',
          { userId: payload.userId },
        );
        throw new NotFoundException('회원 정보가 없습니다.');
      }

      // 사용자 타입 일치 검증
      if (payload.userType !== user.userType) {
        this.securityLogger.logAuthenticationFailure(
          request,
          'User type mismatch',
          {
            userId: payload.userId,
            tokenUserType: payload.userType,
            dbUserType: user.userType,
          },
        );
        throw new UnauthorizedException('사용자 타입이 일치하지 않습니다.');
      }

      request.user = user;
      response.locals.user = user;
      return true;
    } catch (error) {
      this.logger.error('AuthGuard error', error);

      if (error.name === 'TokenExpiredError') {
        this.securityLogger.logTokenEvent(
          request,
          SecurityEventType.TOKEN_EXPIRED,
          'JWT token expired',
        );
        throw new UnauthorizedException('accessToken이 만료되었습니다.');
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.securityLogger.logAuthenticationFailure(request, 'Invalid token', {
        error: error.message,
      });
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }
}
