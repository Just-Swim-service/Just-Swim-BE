import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Res,
  Req,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from 'src/member/member.service';
import { Request, Response } from 'express';
import { AuthMiddleWare } from 'src/auth/middleware/auth.middleware';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // QR코드를 통한 회원 등록
  @UseGuards(AuthMiddleWare)
  @Get('/qr-code')
  async InsertMemberFromQR(
    // @Query('customerId', ParseIntPipe) customerId: number,
    @Query('lectureId', ParseIntPipe) lectureId: number,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    console.log('Cookies:', req.cookies);
    const user = req.user as any;
    console.log('user 1', user);

    try {
        const isExist = await this.memberService.CheckCustomerId(parseInt(user.userId));
        console.log('isExist', isExist);

        if (!isExist) {
            return res.redirect('/signup');
        } else {
            await this.memberService.InsertMemberFromQR(parseInt(user.userId), lectureId);
            res.redirect(`/api/lecture/${lectureId}`);
        }
    } catch (error) {
        console.log('서버 에러', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).redirect('/error');
    }
  }
}
