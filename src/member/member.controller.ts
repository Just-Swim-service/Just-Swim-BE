import { MemberService } from './member.service';
import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

@ApiTags('Member')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // QR코드를 통한 회원 등록
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
    @Req() req: Request,
  ) {
    try {
      const user = res.locals.user;

      const isExist = await this.memberService.checkCustomer(
        parseInt(user.userId),
      );

      if (!isExist) {
        return res.redirect('/signup');
      } else {
        await this.memberService.insertMemberFromQR(
          parseInt(user.userId),
          lectureId,
        );
        res.redirect(`/api/lecture/${lectureId}`);
      }
    } catch (error) {
      console.log('서버 에러', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).redirect('/error');
    }
  }
}
