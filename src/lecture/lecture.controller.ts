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
import {
  lectureDetailByCustomer,
  lectureDetailByInstructor,
  lectureMemberList,
  getScheduleLecturesByCustomer,
  getScheuldeLecturesByInstructor,
  getAllLecturesByInstructor,
} from './example/lecture-example';
import { ResponseService } from 'src/common/response/reponse.service';

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
      this.responseService.success(
        res,
        '스케줄에 해당하는 강의 조회 성공',
        lectures,
      );
    }

    // customer 페이지
    if (userType === 'customer') {
      const lectures =
        await this.lectureService.getScheduleLecturesByCustomer(userId);
      this.responseService.success(
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
      this.responseService.success(res, '강의 전체 조회 성공', lectures);
    }

    // customer
    if (userType === 'customer') {
      const lectures =
        await this.lectureService.getAllLecturesByCustomer(userId);
      this.responseService.success(res, '강의 전체 조회 성공', lectures);
    }
  }

  /* 강의 상세 조회 */
  @Get(':lectureId')
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
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getLectureDetail(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const { userId } = res.locals.user;
    const lecture = await this.lectureService.getLectureByPk(userId, lectureId);

    this.responseService.success(res, '강의 상세 조회 성공', lecture);
  }

  /* 강의 수정 */
  @Patch(':lectureId')
  @ApiBody({ description: '강의 수정을 위한 정보', type: EditLectureDto })
  @ApiOperation({ summary: '강의 수정', description: '강의 내용을 수정' })
  @ApiResponse({ status: 200, description: '강의 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async updateLecture(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() editLectureDto: EditLectureDto,
  ) {
    const { userId } = res.locals.user;

    await this.lectureService.updateLecture(userId, lectureId, editLectureDto);

    this.responseService.success(res, '강의 수정 성공');
  }

  /* 강의 삭제(소프트 삭제) */
  @Delete('/:lectureId')
  @ApiOperation({
    summary: '강의 삭제',
    description: 'instructor가 강의를 삭제합니다.(soft Delete)',
  })
  @ApiResponse({ status: 200, description: '강의 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async softDeleteLecture(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    const { userId } = res.locals.user;

    await this.lectureService.softDeleteLecture(userId, lectureId);

    this.responseService.success(res, '강의 삭제 성공');
  }

  /* 강의 생성 */
  @Post()
  @ApiOperation({
    summary: '강의 생성',
    description: 'instructor가 강의를 새롭게 생성합니다.',
  })
  @ApiBody({ description: '강의 생성을 위한 정보', type: CreateLectureDto })
  @ApiResponse({ status: 200, description: '강의 생성 완료' })
  @ApiResponse({ status: 400, description: '강의 생성 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async createLecture(
    @Res() res: Response,
    @Body() createLectureDto: CreateLectureDto,
  ) {
    const { userId, userType } = res.locals.user;

    if (userType !== 'instructor') {
      this.responseService.unauthorized(res, '강의 생성 권한이 없습니다.');
    }

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
    this.responseService.success(res, '강의 생성 성공', {
      lectureId: newLecture.lectureId,
    });
  }

  /* 강의에 해당하는 수강생 목록 */
  @Get('memberList/:lectureId')
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
    this.responseService.success(
      res,
      '강의에 해당하는 수강생 목록 조회 성공',
      memberList,
    );
  }
}
