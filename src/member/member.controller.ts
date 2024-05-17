import { MemberService } from './member.service';
import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';

@ApiTags('Member')
@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly usersService: UsersService,
  ) {}

  /* QR코드를 통한 회원 등록 */
  @Get('/qr-code')
  @ApiOperation({
    summary: '강의 QR코드를 통한 회원 등록',
    description: 'QR 코드를 통해 고객들이 강의 member가 될 수 있습니다.',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiBearerAuth('accessToken')
  async insertMemberFromQR(
    @Query('lectureId', ParseIntPipe) lectureId: number,
    @Res() res: Response,
  ) {
    try {
      const user = res.locals.user;

      const isExist = await this.usersService.findUserByPk(
        parseInt(user.userId),
      );

      // user 정보가 없을 경우 가입 경로로 redirect
      if (!isExist) {
        res.redirect('/signup');
      }

      // userType이 null 일 경우 userType 지정으로 redirect
      if (isExist.userType === null) {
        res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
      }

      if (isExist.userType !== 'customer') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: '수강생으로 가입하지 않을 경우 수강에 제한이 있습니다.',
        });
      }

      if (isExist.userType === 'customer') {
        await this.memberService.insertMemberFromQR(
          parseInt(user.userId),
          lectureId,
        );
        res.redirect(`/api/lecture/${lectureId}`);
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).redirect('/error');
    }
  }
}
