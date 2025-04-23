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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
    private readonly logger: MyLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 인증 건너뛰기
    const skipAuth = this.reflector.get<boolean>(
      'skipAuth',
      context.getHandler(),
    );
    if (skipAuth) {
      return true;
    }

    const authorizationCookies = request.cookies.authorization;
    const authorizationHeaders = request.headers.authorization;
    const authorization = authorizationCookies
      ? `Bearer ` + authorizationCookies
      : authorizationHeaders;

    // Cookie가 존재하지 않을 경우
    if (!authorization) {
      throw new UnauthorizedException('로그인이 필요한 기능입니다.');
    }

    const [tokenType, tokenValue] = authorization.split(' ');
    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException('잘못된 쿠키 형식입니다.');
    }

    try {
      const { userId } = await this.jwtService.verifyAsync(tokenValue, {
        secret: this.configService.get<string>(envVariables.jwtSecret),
      });

      const user = await this.usersService.findUserByPk(userId);
      if (!user) {
        throw new NotFoundException('회원 정보가 없습니다.');
      }

      request.user = user;
      response.locals.user = user;

      return true;
    } catch (error) {
      this.logger.error(error);
      response.clearCookie('authorization');
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }
}
