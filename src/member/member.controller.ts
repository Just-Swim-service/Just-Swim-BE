import { MemberService } from './member.service';
import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Res,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { allMembersByFeedback, memberInfo } from './example/member-example';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('Member')
@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly usersService: UsersService,
    private readonly reponseService: ResponseService,
  ) {}

  /* QR코드를 통한 회원 등록 */
  @Get('/qr-code')
  @ApiOperation({
    summary: '강의 QR코드를 통한 회원 등록',
    description: 'QR 코드를 통해 고객들이 강의 member가 될 수 있습니다.',
  })
  @ApiResponse({ status: 200, description: '회원 등록 완료' })
  @ApiResponse({ status: 401, description: '수강생이 아닌 경우 등록 불가' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async insertMemberFromQR(
    @Query('lectureId', ParseIntPipe) lectureId: number,
    @Res() res: Response,
  ) {
    try {
      const user = res.locals.user;

      // user 정보가 없을 경우 가입 경로로 redirect
      if (!user) {
        return res.redirect('/signup');
      }

      // userType이 null 일 경우 userType 지정으로 redirect
      if (user.userType === null) {
        return res.redirect(process.env.SELECT_USERTYPE_REDIRECT_URI);
      }

      if (user.userType !== 'customer') {
        this.reponseService.unauthorized(
          res,
          '수강생으로 가입하지 않을 경우 수강에 제한이 있습니다.',
        );
      }

      if (user.userType === 'customer') {
        await this.memberService.insertMemberFromQR(
          parseInt(user.userId),
          lectureId,
        );
        return res.redirect(process.env.HOME_REDIRECT_URI);
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).redirect('/error');
    }
  }

  /* instructor가 피드백 작성 시 강의를 듣고 있는 member 조회 */
  @Get()
  @ApiOperation({
    summary: '피드백 작성 시 member 정보 조회',
    description: '피드백 작성 시 강의에 참여한 member들의 정보를 조회',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        example: allMembersByFeedback,
      },
    },
  })
  @ApiResponse({ status: 401, description: '조회 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getAllMembersByFeedback(@Res() res: Response) {
    const { userId, userType } = res.locals.user;
    if (userType !== 'instructor') {
      return this.reponseService.unauthorized(
        res,
        '수강생 조회 권한이 없습니다.',
      );
    }

    const allMembers = await this.memberService.getAllMembersByFeedback(
      parseInt(userId),
    );

    this.reponseService.success(res, '수강생 조회 성공', allMembers);
  }

  /* instructor가 강의 상세 조회 때 수강생의 강의에 대한 정보 조회 */
  @Get(':memberUserId')
  @ApiOperation({
    summary: '수강생의 강의에 대한 정보 조회',
    description:
      'instructor가 강의 상세 조회 때 수강생의 강의에 대한 정보 조회',
  })
  @ApiParam({
    name: 'memberUserId',
    type: 'number',
    description: '조회할 수강생의 userId',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        example: memberInfo,
      },
    },
  })
  @ApiResponse({ status: 401, description: '수강생 조회 권한이 없습니다.' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getMemberInfo(
    @Res() res: Response,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
  ) {
    const { userId } = res.locals.user;
    const instructorUserId = userId;

    const memberInfo = await this.memberService.getMemberInfo(
      memberUserId,
      instructorUserId,
    );

    this.reponseService.success(res, '수강생 정보 조회 성공', memberInfo);
  }
}
