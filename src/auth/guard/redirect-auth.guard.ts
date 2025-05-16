import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { envVariables } from 'src/common/const/env.const';
import { MyLogger } from 'src/common/logger/logger.service';

@Injectable()
export class RedirectAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly logger: MyLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const authorizationCookies = req.cookies.authorization;
    const refreshToken = req.cookies.refreshToken;
    const authorizationHeaders = req.headers.authorization;
    const authorization = authorizationCookies
      ? `Bearer ` + authorizationCookies
      : authorizationHeaders;

    if (!authorization) {
      // ❗ accessToken 없고 → refreshToken도 없으면 → 로그인 리다이렉트
      if (!refreshToken) {
        res.redirect(process.env.SINGIN_REDIRECT_URI);
        return false;
      } else {
        // refreshToken은 있음 → refresh 페이지로 redirect (선택적)
        res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`);
        return false;
      }
    }

    const [tokenType, tokenValue] = authorization.split(' ');
    if (tokenType !== 'Bearer') {
      res.redirect(process.env.SINGIN_REDIRECT_URI);
      return false;
    }

    try {
      const { userId } = await this.jwtService.verifyAsync(tokenValue, {
        secret: this.configService.get<string>(envVariables.accessTokenSecret),
      });

      const user = await this.usersService.findUserByPk(userId);
      if (!user) {
        res.redirect(process.env.SINGIN_REDIRECT_URI);
        return false;
      }

      req.user = user;
      res.locals.user = user;
      return true;
    } catch (error) {
      this.logger.error(error);

      if (refreshToken) {
        res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`);
        return false;
      }

      res.clearCookie('authorization');
      res.redirect(process.env.SINGIN_REDIRECT_URI);
      return false;
    }
  }
}
