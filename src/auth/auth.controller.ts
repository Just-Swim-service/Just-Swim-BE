import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { SkipAuth } from './decorator/skip-auth.decorator';
import * as cookie from 'cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @SkipAuth()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token이 없습니다.');
    }

    // refreshToken 검증 및 userId 추출
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const userId = payload.userId;

    const { accessToken } = await this.authService.generateAccessToken(userId);

    res.cookie('authorization', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.just-swim.kr',
      path: '/',
      maxAge: 1000 * 60 * 60 * 2,
    });

    return res.json({ message: 'accessToken 재발급 완료' });
  }
}
