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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersDto } from './dto/users.dto';
import { CustomerService } from 'src/customer/customer.service';
import { InstructorService } from 'src/instructor/instructor.service';

@ApiTags('Users')
@Controller()
export class UsersController {
  cache: NodeCache;
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly instructorService: InstructorService,
  ) {
    this.cache = new NodeCache();
  }

  @Get(':userType')
  @ApiOperation({ summary: 'userType 선택' })
  @ApiParam({ name: 'userType', description: 'userType 지정', type: 'string' })
  @ApiResponse({ status: 200, description: 'userType 지정 완료' })
  @ApiResponse({ status: 400, description: 'userType을 지정해주세요' })
  async selectUserType(
    @Param('userType') userType: string,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    let userTypeValue: string = userType;

    if (!userTypeValue) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'userType을 지정해주세요' });
    }

    session.userType = userType;
    return res.status(HttpStatus.OK).json({ message: 'userType 저장 완료' });
  }

  @UseGuards(KakaoAuthGuard)
  @Get('Oauth/kakao')
  @ApiOperation({ summary: 'Kakao login' })
  async kakaoLogin(): Promise<void> {
    return;
  }

  @UseGuards(KakaoAuthGuard)
  @Get('Oauth/kakao/callback')
  @ApiOperation({ summary: 'Kakao callback' })
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
      // const accessToken = await this.authService.getToken(exUser.userId);
      delete session.userType;

      res.redirect(process.env.REDIRECT_URI);
    }
    if (exUser === null) {
      const newUserData: UsersDto = {
        email,
        profileImage,
        name,
        provider,
        userType,
      };
      const newUser = await this.authService.createUser(newUserData);
      let userId: number = newUser.userId;

      if (userType === 'customer') {
        await this.customerService.createCustomer(userId);
      }
      if (userType === 'instructor') {
        await this.instructorService.createInstructor(userId);
      }

      delete session.userType;

      // const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
  }

  @UseGuards(NaverAuthGuard)
  @Get('Oauth/naver')
  @ApiOperation({ summary: 'Naver login' })
  async naverLogin(): Promise<void> {
    return;
  }

  @UseGuards(NaverAuthGuard)
  @Get('Oauth/naver/callback')
  @ApiOperation({ summary: 'Naver callback' })
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
      // const accessToken = await this.authService.getToken(exUser.userId);
      delete session.userType;

      res.redirect(process.env.REDIRECT_URI);
    }
    if (exUser === null) {
      const newUserData: UsersDto = {
        email,
        profileImage,
        name,
        provider,
        userType,
      };
      const newUser = await this.authService.createUser(newUserData);
      let userId: number = newUser.userId;

      if (userType === 'customer') {
        await this.customerService.createCustomer(userId);
      }
      if (userType === 'instructor') {
        await this.instructorService.createInstructor(userId);
      }

      delete session.userType;

      // const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get('Oauth/google')
  @ApiOperation({ summary: 'Google login' })
  async googleLogin(): Promise<void> {
    return;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('Oauth/google/callback')
  @ApiOperation({ summary: 'Google callback' })
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
      // const accessToken = await this.authService.getToken(exUser.userId);
      delete session.userType;

      res.redirect(process.env.REDIRECT_URI);
    }
    if (exUser === null) {
      const newUserData: UsersDto = {
        email,
        profileImage,
        name,
        provider,
        userType,
      };
      const newUser = await this.authService.createUser(newUserData);
      let userId: number = newUser.userId;

      if (userType === 'customer') {
        await this.customerService.createCustomer(userId);
      }
      if (userType === 'instructor') {
        await this.instructorService.createInstructor(userId);
      }
      delete session.userType;

      // const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.REDIRECT_URI);
    }
  }
}
