import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';
import {
  feedbackDetailByCustomer,
  feedbackDetailByInstructor,
  feedbacksByCustomer,
  feedbacksByInstructor,
} from './example/feedbackExample';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /* feedback 전체 조회 */
  @Get()
  @ApiOperation({
    summary: '전체 feedback 조회',
    description: 'feedback을 최신순으로 조회한다',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          feedbacksByInstructor,
          feedbacksByCustomer,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getAllFeedback(@Res() res: Response) {
    const { userType, userId } = res.locals.user;

    // instructor
    if (userType === 'instructor') {
      const feedbacks =
        await this.feedbackService.getAllFeedbackByInstructor(userId);
      return res.status(HttpStatus.OK).json(feedbacks);
    }

    // customer
    if (userType === 'customer') {
      const feedbacks =
        await this.feedbackService.getAllFeedbackByCustomer(userId);
      return res.status(HttpStatus.OK).json(feedbacks);
    }
  }

  /* feedback 상세 조회 */
  @Get(':feedbackId')
  @ApiOperation({
    summary: 'feedback 상세 조회',
    description: 'feedbackId를 통해 feedback을 상세 조회한다',
  })
  @ApiParam({
    name: 'feedbackId',
    type: 'number',
    description: '상세 조회에 필요한 feedbackId',
  })
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        examples: {
          feedbackDetailByInstructor,
          feedbackDetailByCustomer,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getFeedbackDetail(
    @Res() res: Response,
    @Param('feedbackId') feedbackId: number,
  ) {
    const { userId } = res.locals.user;
    const result = await this.feedbackService.getFeedbackByPk(
      userId,
      feedbackId,
    );
    return res.status(HttpStatus.OK).json(result);
  }

  /* feedback 생성 */
  @Post()
  @UseInterceptors(FilesInterceptor('files', 4))
  @ApiOperation({
    summary: 'feedback을 생성 한다',
    description: `수강생을 선택하여 feedback을 남긴다. 
    feedback 이미지는 files로 넘겨주시고 4개까지만 가능합니다.
    feedbackTarget은 lectureId:userId,userId 이런 형태로 넘겨주시면 됩니다.`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description:
              'feedback에 넣을 이미지 입니다. (4개까지만 가능합니다.)',
          },
        },
        feedbackDto: {
          type: 'object',
          properties: {
            feedbackType: {
              type: 'string',
              example: 'group',
              description: '피드백 타입 설정',
            },
            feedbackDate: {
              type: 'string',
              example: '2024.04.22',
              description: 'feedback을 남길 강의 날짜',
            },
            feedbackLink: {
              type: 'string',
              example: 'URL',
              description: 'feedback에 남길 관련 링크',
            },
            feedbackContent: {
              type: 'string',
              example:
                '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
              description: 'feedback 내용',
            },
            feedbackTarget: {
              type: 'array',
              example: [
                { lectureId: 1, userIds: [2, 3] },
                { lectureId: 2, userIds: [4, 5, 13] },
              ],
              description: 'lectureId와 userIds 쌍의 배열',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'feedback 생성 성공' })
  @ApiResponse({ status: 400, description: 'feedback 생성 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async createFeedback(
    @Res() res: Response,
    @Body() feedbackDto: FeedbackDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { userId, userType } = res.locals.user;

    if (userType !== 'instructor') {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'feedback 작성 권한이 없습니다.' });
    }
    if (feedbackDto.feedbackTarget.length === 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'feedback 대상을 지정해주세요' });
    }

    const feedback = await this.feedbackService.createFeedback(
      userId,
      feedbackDto,
      files,
    );
    if (!feedback) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'feedback 생성 실패' });
    }
    // feedback 생성 후에 feedbackTargetList에 맞게 feedbackTarget 생성
    if (feedback) {
      await this.feedbackService.createFeedbackTarget(
        feedback.feedbackId,
        feedbackDto.feedbackTarget,
      );
    }
    return res.status(HttpStatus.OK).json({ message: 'feedback 생성 성공' });
  }

  /* feedback 수정 */
  @Patch(':feedbackId')
  @UseInterceptors(FilesInterceptor('files', 4))
  @ApiOperation({
    summary: '작성했던 feedback을 수정한다.',
    description: 'instructor가 본인이 작성한 feedback을 수정한다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description:
              'feedback에 넣을 이미지 입니다. (4개까지만 가능합니다.)',
          },
        },
        editFeedbackDto: {
          type: 'object',
          properties: {
            feedbackType: {
              type: 'string',
              example: 'group',
              description: '피드백 타입 설정',
            },
            feedbackDate: {
              type: 'string',
              example: '2024.04.22',
              description: 'feedback을 남길 강의 날짜',
            },
            feedbackLink: {
              type: 'string',
              example: 'URL',
              description: 'feedback에 남길 관련 링크',
            },
            feedbackContent: {
              type: 'string',
              example:
                '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
              description: 'feedback 내용',
            },
            feedbackTarget: {
              type: 'array',
              example: [
                { lectureId: 1, userIds: [2, 3] },
                { lectureId: 2, userIds: [4, 5, 13] },
              ],
              description: 'lectureId와 userIds 쌍의 배열',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'feedback 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async updateFeedback(
    @Res() res: Response,
    @Param('feedbackId') feedbackId: number,
    @Body() editFeedbackDto: EditFeedbackDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { userId } = res.locals.user;

    await this.feedbackService.updateFeedback(
      userId,
      feedbackId,
      editFeedbackDto,
      files,
    );

    return res.status(HttpStatus.OK).json({ message: 'feedback 수정 성공' });
  }

  /* feedback 삭제(softDelete) */
  @Delete(':feedbackId')
  @ApiOperation({
    summary: 'feedback을 soft delete 한다.',
    description: 'feedbackId를 이용하여 해당 feedback을 soft delete한다.',
  })
  @ApiResponse({ status: 200, description: 'feedback 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async softDeleteFeedback(
    @Res() res: Response,
    @Param('feedbackId') feedbackId: number,
  ) {
    const { userId } = res.locals.user;

    await this.feedbackService.softDeleteFeedback(userId, feedbackId);

    return res.status(HttpStatus.OK).json({ message: 'feedback 삭제 성공' });
  }
}
