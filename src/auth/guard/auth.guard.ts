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

    const skipAuth = this.reflector.get<boolean>(
      'skipAuth',
      context.getHandler(),
    );
    if (skipAuth) return true;

    const cookieToken = request.cookies.authorization;
    const headerToken = request.headers.authorization;
    const authorization = cookieToken ? `Bearer ${cookieToken}` : headerToken;

    if (!authorization) {
      throw new UnauthorizedException('로그인이 필요한 기능입니다.');
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('잘못된 인증 형식입니다.');
    }

    try {
      const { userId } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(envVariables.accessTokenSecret),
      });

      const user = await this.usersService.findUserByPk(userId);
      if (!user) {
        throw new NotFoundException('회원 정보가 없습니다.');
      }

      request.user = user;
      return true;
    } catch (error) {
      this.logger.error('AuthGuard error', error);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('accessToken이 만료되었습니다.');
      }

      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }
}
