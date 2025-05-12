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
    const authorizationHeaders = req.headers.authorization;
    const authorization = authorizationCookies
      ? `Bearer ` + authorizationCookies
      : authorizationHeaders;

    if (!authorization) {
      res.redirect(process.env.SINGIN_REDIRECT_URI);
      return false;
    }

    const [tokenType, tokenValue] = authorization.split(' ');
    if (tokenType !== 'Bearer') {
      res.redirect(process.env.SINGIN_REDIRECT_URI);
      return false;
    }

    try {
      const { userId } = await this.jwtService.verifyAsync(tokenValue, {
        secret: this.configService.get<string>(envVariables.jwtSecret),
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
      res.clearCookie('authorization');
      res.redirect(process.env.SINGIN_REDIRECT_URI);
      return false;
    }
  }
}
