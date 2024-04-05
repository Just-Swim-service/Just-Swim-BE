import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthMiddleWare implements NestMiddleware<Request, Response> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
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
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: '로그인이 필요한 기능입니다.' });
      }

      // Cookie가 존재할 경우
      const [tokenType, tokenValue] = authorization.split(' ');
      if (tokenType !== 'Bearer') {
        res.clearCookie('authorization');
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: '잘못된 쿠키 형식입니다.' });
      }

      const { userId } = this.jwtService.verify(tokenValue, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.usersService.findUserByPk(userId);

      if (user) {
        res.locals.user = user;
        next();
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '회원 정보가 없습니다.' });
      }
    } catch (e) {
      res.clearCookie('authorization');
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: '잘못된 인증 방법입니다.(auth.middleware)' });
    }
  }
}
