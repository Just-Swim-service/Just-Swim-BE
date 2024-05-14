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
    summary: '스케줄 - 강의 전체 조회',
    description: '스케줄에 보여줄 강의를 전체 조회',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          lectures: {
            value: [
              {
                lectureId: '1',
                lectureTitle: '아침 5반',
                lectureContent:
                  '초보반으로 발차기 및 자유형 위주로 수업합니다.',
                lectureTime: '11:00 ~ 12:00',
                lectureDays: '화목',
                lectureLocation: '강동구 실내 수영장',
                lectureColor: '#F1554C',
                lectureQRCode: 'QR 코드',
                lectureEndDate: '2024.10.31',
                lectureMembers: [],
              },
              {
                lectureId: '30',
                lectureTitle: '생존 수영반',
                lectureContent: '생존 수영 위주로 수업합니다.',
                lectureTime: '09:00 ~ 10:00',
                lectureDays: '월수금',
                lectureLocation: '고양체육관',
                lectureColor: '#F1547C',
                lectureQRCode: 'QR 코드',
                lectureEndDate: '2024.10.31',
                lectureMembers: [],
              },
            ],
          },
        },
      },
    },
  })
  @ApiBearerAuth('accessToken')
  async getLecturesForSchedule(@Res() res: Response) {
    try {
      const user = res.locals.user;
      const userType = user.userType;

      if (userType === 'instructor') {
        const userId = user.userId;
        // 삭제 처리 된 lecture는 제외해서 조회
        const lectures =
          await this.lectureService.getLecturesByInstructor(userId);
        return res.status(HttpStatus.OK).json(lectures);
      }

      // if (userType === 'customer') {
      //   const customerId = user.customerInfo.customerId;
      // }
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
          lectures: {
            value: [
              {
                lectureId: '1',
                lectureTitle: '아침 5반',
                lectureContent:
                  '초보반으로 발차기 및 자유형 위주로 수업합니다.',
                lectureTime: '11:00 ~ 12:00',
                lectureDays: '화목',
                lectureLocation: '강동구 실내 수영장',
                lectureColor: '#F1554C',
                lectureQRCode: 'QR 코드',
                lectureEndDate: '2024.10.31',
                lectureDeletedAt: null,
                lectureMembers: [],
              },
              {
                lectureId: '5',
                lectureTitle: '생존 수영반',
                lectureContent: '생존 수영 위주로 수업합니다.',
                lectureTime: '09:00 ~ 10:00',
                lectureDays: '월수금',
                lectureLocation: '고양체육관',
                lectureColor: '#F1547C',
                lectureQRCode: 'QR 코드',
                lectureEndDate: '2024.04.10',
                lectureDeletedAt: '2024.04.10',
                lectureMembers: [],
              },
            ],
          },
        },
      },
    },
  })
  @ApiBearerAuth('accessToken')
  async getAllLectures(@Res() res: Response) {
    try {
      const user = res.locals.user;
      const userType = user.userType;

      if (userType === 'instructor') {
        const userId = user.userId;
        // 삭제 된 강의 포함 lecture 조회
        const lectures =
          await this.lectureService.getAllLecturesByInstructor(userId);
        return res.status(HttpStatus.OK).json(lectures);
      }

      // 수강생 디자인에 맞춰 작업
      // if (userType === 'customer') {
      //   const customerId = user.customerInfo.customerId;
      // }
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
    schema: {
      example: {
        lectureTitle: '생존 수영반',
        lectureContent: '생존 수영 위주로 수업합니다.',
        lectureTime: '09:00 ~ 10:00',
        lectureDays: '월수금',
        lectureLocation: '고양체육관',
        lectureColor: '#F1547C',
        lectureQRCode: 'QR 코드',
        lectureEndDate: '2024.05.31',
        lectureMembers: [],
      },
    },
  })
  @ApiBearerAuth('accessToken')
  async getLectureDetail(
    @Res() res: Response,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    try {
      const lecture = await this.lectureService.getLectureByPk(lectureId);
      if (lecture === null) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '존재하지 않는 강좌입니다.' });
      }
      return res.status(HttpStatus.OK).json(lecture);
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

      const lecture = await this.lectureService.getLectureByPk(lectureId);
      if (lecture === null) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '존재하지 않는 강좌입니다.' });
      }

      if (lecture.userId !== userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: '강의 수정 권한이 없습니다.' });
      }

      await this.lectureService.updateLecture(lectureId, editLectureDto);

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

      const lecture = await this.lectureService.getLectureByPk(lectureId);
      if (lecture === null) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '존재하지 않는 강좌입니다.' });
      }

      if (lecture.userId !== userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: '강의 삭제 권한이 없습니다.' });
      }

      await this.lectureService.softDeleteLecture(lectureId);

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
        await this.memberService.getAllMemberByInstructor(lectureId);
      return res.status(HttpStatus.OK).json(memberList);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }
}
