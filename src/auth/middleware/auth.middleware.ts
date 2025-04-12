import {
  HttpStatus,
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { MyLogger } from 'src/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { envVariables } from 'src/common/const/env.const';

@Injectable()
export class AuthMiddleWare implements NestMiddleware<Request, Response> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly logger: MyLogger,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationCookies = req.cookies.authorization;
      const authorizationHeaders = req.headers.authorization;
      const authorization = authorizationCookies
        ? `Bearer ` + authorizationCookies
        : authorizationHeaders;
      // Cookie가 존재하지 않을 경우
      if (!authorization) {
        throw new UnauthorizedException('로그인이 필요한 기능입니다.');
      }

      // Cookie가 존재할 경우
      const [tokenType, tokenValue] = authorization.split(' ');
      if (tokenType !== 'Bearer') {
        res.clearCookie('authorization');
        throw new UnauthorizedException('잘못된 쿠키 형식입니다.');
      }

      const { userId } = await this.jwtService.verifyAsync(tokenValue, {
        secret: this.configService.get<string>(envVariables.jwtSecret),
      });
      const user = await this.usersService.findUserByPk(userId);

      if (user) {
        res.locals.user = user;
        req.user = user;
        next();
      } else {
        throw new NotFoundException('회원 정보가 없습니다.');
      }
    } catch (error) {
      this.logger.error(error);
      res.clearCookie('authorization');
      next(error);
    }
  }
}
