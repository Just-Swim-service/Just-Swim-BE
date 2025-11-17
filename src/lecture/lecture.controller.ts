import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Res,
  HttpStatus,
  Patch,
  UseGuards,
  Query,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { LectureService } from './lecture.service';
import { EditLectureDto } from './dto/edit-lecture.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MemberService } from 'src/member/member.service';
import { LectureOwnershipGuard } from 'src/auth/guard/lecture-ownership.guard';
import { UserTypeGuard, RequireUserType } from 'src/auth/guard/user-type.guard';
import { UserType } from 'src/users/enum/user-type.enum';
import {
  lectureDetailByCustomer,
  lectureDetailByInstructor,
  lectureMemberList,
  getScheduleLecturesByCustomer,
  getScheuldeLecturesByInstructor,
  getAllLecturesByInstructor,
} from './example/lecture-example';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('Lecture')
@Controller('lecture')
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly memberService: MemberService,
    private readonly responseService: ResponseService,
  ) {}

  /* 스케줄 - 강의 전체 조회(삭제된 강의는 제외) */
  @Get('schedule')
  @ApiOperation({
    summary: '스케줄러 - 진행 중인 나의 강의 조회',
    description: '스케줄러에 보여줄 진행 중인 나의 강의 조회',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          getScheuldeLecturesByInstructor,
          getScheduleLecturesByCustomer,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getLecturesForSchedule(@Res() res: Response) {
    const { userType, userId } = res.locals.user;

    // instructor 페이지
    if (userType === 'instructor') {
      const lectures =
        await this.lectureService.getScheduleLecturesByInstructor(userId);
      return this.responseService.success(
        res,
        '스케줄에 해당하는 강의 조회 성공',
        lectures,
      );
    }

    // customer 페이지
    if (userType === 'customer') {
      const lectures =
        await this.lectureService.getScheduleLecturesByCustomer(userId);
      return this.responseService.success(
        res,
        '스케줄에 해당하는 강의 조회 성공',
        lectures,
      );
    }
  }

  /* 강의 전체 조회(삭제된 강의 모두 조회) */
  @Get('myLectures')
  @ApiOperation({
    summary: '나의 강의 전체 조회',
    description: '나의 모든 강의를 조회 한다.',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          AllLecturesByInstructor: getAllLecturesByInstructor,
          AllLecturesByCustomer: getScheduleLecturesByCustomer,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getAllLectures(@Res() res: Response) {
    const { userType, userId } = res.locals.user;

    // instructor
    if (userType === 'instructor') {
      const lectures =
        await this.lectureService.getAllLecturesByInstructor(userId);
      return this.responseService.success(res, '강의 전체 조회 성공', lectures);
    }

    // customer
    if (userType === 'customer') {
      const lectures =
        await this.lectureService.getAllLecturesByCustomer(userId);
      return this.responseService.success(res, '강의 전체 조회 성공', lectures);
    }
  }

  /* 강의 미리보기 (QR 토큰으로 조회) */
  @Get('preview')
  @ApiOperation({
    summary: '강의 미리보기 (토큰)',
    description:
      'QR 토큰을 통해 강의 정보를 미리 확인합니다. 토큰이 우선적으로 사용됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '강의 정보 조회 성공',
    type: Object,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (삭제/종료된 강의)' })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  @ApiResponse({ status: 404, description: '강의를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getLecturePreviewByToken(
    @Res() res: Response,
    @Query('token') token?: string,
    @Query('lectureId') lectureId?: string,
  ) {
    try {
      let lecturePreview;

      // 토큰이 있으면 토큰 방식, 없으면 기존 lectureId 방식 (하위 호환성)
      if (token) {
        lecturePreview =
          await this.lectureService.getLecturePreviewByToken(token);
      } else if (lectureId) {
        const parsedLectureId = parseInt(lectureId);
        if (isNaN(parsedLectureId)) {
          return this.responseService.badRequest(
            res,
            '유효하지 않은 강의 ID입니다.',
          );
        }
        lecturePreview = await this.lectureService.getLecturePreview(
          parsedLectureId,
        );
      } else {
        return this.responseService.badRequest(
          res,
          'QR 토큰 또는 강의 ID가 필요합니다.',
        );
      }

      return this.responseService.success(
        res,
        '강의 정보 조회 성공',
        lecturePreview,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.responseService.notFound(res, error.message);
      }
      if (error instanceof BadRequestException) {
        return this.responseService.badRequest(res, error.message);
      }
      if (error instanceof UnauthorizedException) {
        return this.responseService.unauthorized(res, error.message);
      }
      return this.responseService.internalServerError(
        res,
        '강의 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /* 강의 미리보기 (QR 스캔 시 사용) - 하위 호환성 유지 */
  @Get(':lectureId/preview')
  @ApiOperation({
    summary: '강의 미리보기 (강의 ID)',
    description: 'QR 스캔 후 등록 전 강의 정보를 미리 확인합니다.',
  })
  @ApiParam({
    name: 'lectureId',
    description: '강의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '강의 정보 조회 성공',
    type: Object,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (삭제/종료된 강의)' })
  @ApiResponse({ status: 404, description: '강의를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getLecturePreview(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const lecturePreview =
      await this.lectureService.getLecturePreview(lectureId);

    return this.responseService.success(
      res,
      '강의 정보 조회 성공',
      lecturePreview,
    );
  }

  /* 강의 상세 조회 */
  @Get(':lectureId')
  @UseGuards(LectureOwnershipGuard)
  @ApiOperation({
    summary: '강의 상세 조회',
    description: '강의를 상세한 내용을 조회한다',
  })
  @ApiParam({
    name: 'lectureId',
    type: 'number',
    description: '강의 Id',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          lectureDetailByInstructor: lectureDetailByInstructor,
          lectureDetailByCustomer: lectureDetailByCustomer,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getLectureDetail(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const { userId } = res.locals.user;
    const lecture = await this.lectureService.getLectureByPk(userId, lectureId);

    return this.responseService.success(res, '강의 상세 조회 성공', lecture);
  }

  /* 강의 수정 */
  @Patch(':lectureId')
  @UseGuards(LectureOwnershipGuard, UserTypeGuard)
  @RequireUserType([UserType.Instructor])
  @ApiBody({ description: '강의 수정을 위한 정보', type: EditLectureDto })
  @ApiOperation({ summary: '강의 수정', description: '강의 내용을 수정' })
  @ApiResponse({ status: 200, description: '강의 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async updateLecture(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() editLectureDto: EditLectureDto,
  ) {
    const { userId } = res.locals.user;

    await this.lectureService.updateLecture(userId, lectureId, editLectureDto);

    return this.responseService.success(res, '강의 수정 성공');
  }

  /* QR 코드 동적 생성 */
  @Get(':lectureId/qr-code')
  @UseGuards(LectureOwnershipGuard, UserTypeGuard)
  @RequireUserType([UserType.Instructor])
  @ApiOperation({
    summary: 'QR 코드 동적 생성',
    description:
      '강사가 요청할 때마다 새로운 토큰으로 QR 코드를 동적으로 생성합니다.',
  })
  @ApiParam({
    name: 'lectureId',
    type: 'number',
    description: '강의 ID',
  })
  @ApiResponse({
    status: 200,
    description: 'QR 코드 생성 성공 (Base64 Data URL)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            qrCode: { type: 'string', description: 'Base64 Data URL' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '강의를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async generateQRCode(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const { userId } = res.locals.user;

    // 권한 확인 (강사만 자신의 강의 QR 코드 생성 가능)
    const lecture = await this.lectureService.getLectureByPk(userId, lectureId);
    if (!lecture) {
      return this.responseService.unauthorized(
        res,
        '강의 접근 권한이 없습니다.',
      );
    }

    try {
      const qrCodeData = await this.lectureService.generateQRCode(lectureId);

      return this.responseService.success(res, 'QR 코드 생성 성공', {
        qrCode: qrCodeData,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.responseService.notFound(res, error.message);
      }
      return this.responseService.internalServerError(
        res,
        'QR 코드 생성 중 오류가 발생했습니다.',
      );
    }
  }

  /* 강의 삭제(소프트 삭제) */
  @Delete('/:lectureId')
  @UseGuards(LectureOwnershipGuard, UserTypeGuard)
  @RequireUserType([UserType.Instructor])
  @ApiOperation({
    summary: '강의 삭제',
    description: 'instructor가 강의를 삭제합니다.(soft Delete)',
  })
  @ApiResponse({ status: 200, description: '강의 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async softDeleteLecture(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const { userId } = res.locals.user;

    await this.lectureService.softDeleteLecture(userId, lectureId);

    return this.responseService.success(res, '강의 삭제 성공');
  }

  /* 강의 생성 */
  @Post()
  @UseGuards(UserTypeGuard)
  @RequireUserType([UserType.Instructor])
  @ApiOperation({
    summary: '강의 생성',
    description: 'instructor가 강의를 새롭게 생성합니다.',
  })
  @ApiBody({ description: '강의 생성을 위한 정보', type: CreateLectureDto })
  @ApiResponse({ status: 200, description: '강의 생성 완료' })
  @ApiResponse({ status: 400, description: '강의 생성 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async createLecture(
    @Res() res: Response,
    @Body() createLectureDto: CreateLectureDto,
  ) {
    const { userId } = res.locals.user;

    const newLecture = await this.lectureService.createLecture(
      userId,
      createLectureDto,
    );

    if (!newLecture) {
      return this.responseService.error(
        res,
        '강의 생성 권한이 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.responseService.success(res, '강의 생성 성공', {
      lectureId: newLecture.lectureId,
    });
  }

  /* 강의에 해당하는 수강생 목록 */
  @Get('memberList/:lectureId')
  @UseGuards(LectureOwnershipGuard, UserTypeGuard)
  @RequireUserType([UserType.Instructor])
  @ApiOperation({
    summary: '수강생 목록을 조회',
    description: 'instructor가 개설한 강의 목록에 참여한 수강생 list를 조회',
  })
  @ApiParam({
    name: 'lectureId',
    type: 'number',
    description: '강의 Id',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          members: lectureMemberList,
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiBearerAuth('accessToken')
  async getAllMemberByInstructor(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const user = res.locals.user;
    const userType = user.userType;

    if (userType !== 'instructor') {
      return this.responseService.unauthorized(res, '접근 권한이 없습니다.');
    }
    const memberList =
      await this.memberService.getAllMembersByLectureId(lectureId);
    return this.responseService.success(
      res,
      '강의에 해당하는 수강생 목록 조회 성공',
      memberList,
    );
  }
}
