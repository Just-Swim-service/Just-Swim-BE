import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { KakaoAuthGuard } from 'src/auth/guard/kakao.guard';
import { AuthService } from 'src/auth/auth.service';
import { NaverAuthGuard } from 'src/auth/guard/naver.guard';
import { GoogleAuthGuard } from 'src/auth/guard/google.guard';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersDto } from './dto/users.dto';
import { CustomerService } from 'src/customer/customer.service';
import { InstructorService } from 'src/instructor/instructor.service';
import { UserTypeDto } from './dto/userType.dto';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly instructorService: InstructorService,
  ) {}

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
  ): Promise<void> {
    let profile: any = req.user;
    let provider: string = profile.provider;
    let name: string = profile.username;
    let email: string = profile._json.kakao_account.email;
    let profileImage: string = profile._json.properties.profile_image;

    const exUser = await this.authService.validateUser(email, provider);
    if (exUser) {
      if (exUser.userType === null) {
        // const accessToken = await this.authService.getToken(exUser.userId);

        res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
      }
      if (exUser.userType !== null) {
        // const accessToken = await this.authService.getToken(exUser.userId);
        res.redirect(process.env.HOME_REDIRECT_URI);
      }
    }
    if (exUser === null) {
      const newUserData: UsersDto = {
        email,
        profileImage,
        name,
        provider,
      };
      const newUser = await this.authService.createUser(newUserData);
      let userId: number = newUser.userId;

      // const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
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
  ): Promise<void> {
    let profile: any = req.user;
    let provider: string = profile.provider;
    let name: string = profile.name;
    let email: string = profile.email;
    let profileImage: string = profile.profileImage;

    const exUser = await this.authService.validateUser(email, provider);
    if (exUser) {
      if (exUser.userType === null) {
        // const accessToken = await this.authService.getToken(exUser.userId);

        res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
      }
      if (exUser.userType !== null) {
        // const accessToken = await this.authService.getToken(exUser.userId);
        res.redirect(process.env.HOME_REDIRECT_URI);
      }
    }
    if (exUser === null) {
      const newUserData: UsersDto = {
        email,
        profileImage,
        name,
        provider,
      };
      const newUser = await this.authService.createUser(newUserData);
      let userId: number = newUser.userId;

      // const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
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
  ): Promise<void> {
    let profile: any = req.user;
    let provider: string = profile.provider;
    let name: string = profile._json.name;
    let email: string = profile._json.email;
    let profileImage: string = profile._json.picture;

    const exUser = await this.authService.validateUser(email, provider);
    if (exUser) {
      if (exUser.userType === null) {
        // const accessToken = await this.authService.getToken(exUser.userId);

        res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
      }
      if (exUser.userType !== null) {
        // const accessToken = await this.authService.getToken(exUser.userId);
        res.redirect(process.env.HOME_REDIRECT_URI);
      }
    }
    if (exUser === null) {
      const newUserData: UsersDto = {
        email,
        profileImage,
        name,
        provider,
      };
      const newUser = await this.authService.createUser(newUserData);
      let userId: number = newUser.userId;

      // const accessToken = await this.authService.getToken(newUser.userId);
      res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
    }
  }

  @Post('user/:userId')
  @ApiOperation({ summary: 'userType 선택' })
  @ApiParam({ name: 'userId', description: 'userId', type: 'number' })
  @ApiBody({ type: UserTypeDto })
  @ApiResponse({ status: 200, description: 'userType 지정 완료' })
  @ApiResponse({ status: 400, description: 'userType을 지정해주세요' })
  async selectUserType(
    @Param('userId') userId: number,
    @Body() userTypeDto: UserTypeDto,
    @Res() res: Response,
  ) {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: '유저 정보를 확인해주세요' });
    }
    if (user.userType !== null) {
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ message: '계정에 타입이 이미 지정되어 있습니다.' });
    }

    if (userTypeDto.userType === 'customer') {
      await this.customerService.createCustomer(userId);
    }
    if (userTypeDto.userType === 'instructor') {
      await this.instructorService.createInstructor(userId);
    }

    await this.usersService.selectUserType(userId, userTypeDto);
    return res.status(HttpStatus.OK).json({ message: 'userType 지정 완료' });
  }
}
