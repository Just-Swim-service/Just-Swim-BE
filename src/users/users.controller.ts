import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { KakaoAuthGuard } from 'src/auth/guard/kakao.guard';
import { AuthService } from 'src/auth/auth.service';
import * as NodeCache from 'node-cache';
import { NaverAuthGuard } from 'src/auth/guard/naver.guard';
import { GoogleAuthGuard } from 'src/auth/guard/google.guard';

@Controller()
export class UsersController {
  cache: NodeCache;
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    this.cache = new NodeCache();
  }

  @Get(':userType')
  async selectUserType(
    @Param('userType') userType: string,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    let value: string = userType;

    if (!value) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'userType을 지정해주세요' });
    }

    session.userType = userType;
    return res.status(HttpStatus.OK).json({ message: 'userType 저장 완료' });
  }

  @UseGuards(KakaoAuthGuard)
  @Get('Oauth/kakao')
  async kakaoLogin(): Promise<void> {
    return;
  }

  @UseGuards(KakaoAuthGuard)
  @Get('Oauth/kakao/callback')
  async kakaoCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ): Promise<void> {
    let profile: any = req.user;
    let provider: string = profile.provider;
    let name: string = profile.username;
    let email: string = profile._json.kakao_account.email;
    let profileImage: string = profile._json.properties.profile_image;
    let userType: string = session.userType;

    const exUser = await this.authService.validateUser(email, provider);
    if (exUser) {
      const accessToken = await this.authService.getToken(exUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
    if (exUser === null) {
      const newUser = await this.authService.createUser({
        email,
        profileImage,
        name,
        provider,
        userType,
      });
      delete session.userType;

      const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
  }

  @UseGuards(NaverAuthGuard)
  @Get('Oauth/naver')
  async naverLogin(): Promise<void> {
    return;
  }

  @UseGuards(NaverAuthGuard)
  @Get('Oauth/naver/callback')
  async naverCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ): Promise<void> {
    let profile: any = req.user;
    let provider: string = profile.provider;
    let name: string = profile.name;
    let email: string = profile.email;
    let profileImage: string = profile.profileImage;
    let userType: string = session.userType;

    const exUser = await this.authService.validateUser(email, provider);
    if (exUser) {
      const accessToken = await this.authService.getToken(exUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
    if (exUser === null) {
      const newUser = await this.authService.createUser({
        email,
        profileImage,
        name,
        provider,
        userType,
      });
      delete session.userType;

      const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get('Oauth/google')
  async googleLogin(): Promise<void> {
    return;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('Oauth/google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ): Promise<void> {
    let profile: any = req.user;
    let provider: string = profile.provider;
    let name: string = profile._json.name;
    let email: string = profile._json.email;
    let profileImage: string = profile._json.picture;
    let userType: string = session.userType;

    const exUser = await this.authService.validateUser(email, provider);
    if (exUser) {
      const accessToken = await this.authService.getToken(exUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
    if (exUser === null) {
      const newUser = await this.authService.createUser({
        email,
        profileImage,
        name,
        provider,
        userType,
      });
      delete session.userType;

      const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
  }
}
