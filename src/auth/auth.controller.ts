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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @SkipAuth()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token이 없습니다.');
    }

    // refreshToken 검증 및 userId 추출
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const userId = payload.userId;

    const isValid = await this.usersService.validateRefreshToken(
      userId,
      refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('유효하지 않은 refreshToken입니다.');
    }

    const { accessToken } = await this.authService.getToken(userId);

    res.cookie('authorization', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.just-swim.kr',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    return res.json({ message: 'accessToken 재발급 완료' });
  }
}
