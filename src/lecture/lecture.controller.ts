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
import { EditLectureDto } from './dto/editLecture.dto';
import { LectureDto } from './dto/lecture.dto';
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
  lecturesByCustomer,
  lecturesByInstructor,
} from './example/lecture-example';

@ApiTags('Lecture')
@Controller('lecture')
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly memberService: MemberService,
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
          lecturesByInstructor,
          lecturesByCustomer,
        },
      },
    },
  })
  @ApiBearerAuth('accessToken')
  async getLecturesForSchedule(@Res() res: Response) {
    try {
      const { userType, userId } = res.locals.user;

      // instructor 페이지
      if (userType === 'instructor') {
        const lectures =
          await this.lectureService.getLecturesByInstructor(userId);
        return res.status(HttpStatus.OK).json(lectures);
      }

      // customer 페이지
      if (userType === 'customer') {
        const lectures =
          await this.lectureService.getLecturesByCustomer(userId);
        return res.status(HttpStatus.OK).json(lectures);
      }
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
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
          AllLectureByInstructor: lecturesByInstructor,
          AllLectureByCustomer: lecturesByCustomer,
        },
      },
    },
  })
  @ApiBearerAuth('accessToken')
  async getAllLectures(@Res() res: Response) {
    try {
      const { userType, userId } = res.locals.user;

      // instructor
      if (userType === 'instructor') {
        const lectures =
          await this.lectureService.getAllLecturesByInstructor(userId);
        return res.status(HttpStatus.OK).json(lectures);
      }

      // customer
      if (userType === 'customer') {
        const lectures =
          await this.lectureService.getAllLecturesByCustomer(userId);
        return res.status(HttpStatus.OK).json(lectures);
      }
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* 강의 상세 조회 */
  @Get('/:lectureId')
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
  @ApiBearerAuth('accessToken')
  async getLectureDetail(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    try {
      const { userId } = res.locals.user;
      const result = await this.lectureService.getLectureByPk(
        userId,
        lectureId,
      );

      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* 강의 수정 */
  @Patch(':lectureId')
  @ApiOperation({
    summary: '강의 수정',
    description: '강의 내용을 수정',
  })
  @ApiResponse({
    status: 200,
    description: '강의 수정 성공',
  })
  @ApiBearerAuth('accessToken')
  async updateLecture(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() editLectureDto: EditLectureDto,
  ) {
    try {
      const { userId } = res.locals.user;

      await this.lectureService.updateLecture(
        userId,
        lectureId,
        editLectureDto,
      );

      return res.status(HttpStatus.OK).json({ message: '강의 수정 성공' });
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* 강의 삭제(소프트 삭제) */
  @Delete('/:lectureId')
  @ApiOperation({
    summary: '강의 삭제',
    description: 'instructor가 강의를 삭제합니다.(soft Delete)',
  })
  @ApiResponse({
    status: 200,
    description: '강의 삭제 성공',
  })
  @ApiBearerAuth('accessToken')
  async softDeleteLecture(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    try {
      const { userId } = res.locals.user;

      await this.lectureService.softDeleteLecture(userId, lectureId);

      return res.status(HttpStatus.OK).json({ message: '강의 삭제 성공' });
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* 강의 생성 */
  @Post()
  @ApiOperation({
    summary: '강의 생성',
    description: 'instructor가 강의를 새롭게 생성합니다.',
  })
  @ApiBody({ description: '강의 생성을 위한 ', type: LectureDto })
  @ApiResponse({ status: 200, description: '강의 생성 완료' })
  @ApiBearerAuth('accessToken')
  async createLecture(@Res() res: Response, @Body() lectureDto: LectureDto) {
    try {
      const { userId, userType } = res.locals.user;

      if (userType !== 'instructor') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: '강의 생성 권한이 없습니다.' });
      }

      const newLecture = await this.lectureService.createLecture(
        userId,
        lectureDto,
      );

      if (!newLecture) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '강의 생성 실패' });
      }

      return res.status(HttpStatus.OK).json({ message: '강의 생성 성공' });
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* 강의 QR코드 생성 */
  @Post(':lectureId/qr-code')
  async createQRCode(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body('lectureQRCode') lectureQRCode: string,
  ) {
    try {
      await this.lectureService.saveQRCode(lectureId, lectureQRCode);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
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
          members: {
            value: [
              {
                memberId: '1',
                userId: '1',
                memberNickname: '홍길동',
                profileImage: 'URL',
              },
              {
                memberId: '2',
                userId: '10',
                memberNickname: '홍길순',
                profileImage: 'URL',
              },
            ],
          },
        },
      },
    },
  })
  @ApiBearerAuth('accessToken')
  async getAllMemberByInstructor(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    try {
      const user = res.locals.user;
      const userType = user.userType;

      if (userType !== 'instructor') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: '접근 권한이 없습니다.' });
      }
      const memberList =
        await this.memberService.getAllMembersByLectureId(lectureId);
      return res.status(HttpStatus.OK).json(memberList);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }
}
