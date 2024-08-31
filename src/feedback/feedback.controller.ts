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
import {
  feedbackDetailByCustomer,
  feedbackDetailByInstructor,
  feedbacksByCustomer,
  feedbacksByInstructor,
} from './example/feedback-example';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FeedbackImageDto } from 'src/image/dto/feedback-image.dto';
import { EditFeedbackImageDto } from 'src/image/dto/edit-feedback-image.dto';
import { ResponseService } from 'src/common/response/reponse.service';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly responseService: ResponseService,
  ) {}

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
      return this.responseService.success(
        res,
        'feedback 전체 조회 성공',
        feedbacks,
      );
    }

    // customer
    if (userType === 'customer') {
      const feedbacks =
        await this.feedbackService.getAllFeedbackByCustomer(userId);
      return this.responseService.success(
        res,
        'feedback 전체 조회 성공',
        feedbacks,
      );
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
    const feedback = await this.feedbackService.getFeedbackByPk(
      userId,
      feedbackId,
    );
    return this.responseService.success(
      res,
      'feedback 상세 조회 성공',
      feedback,
    );
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
    description: '이미지 업로드',
    type: FeedbackImageDto,
  })
  @ApiResponse({ status: 200, description: 'feedback 생성 성공' })
  @ApiResponse({ status: 400, description: 'feedback 생성 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async createFeedback(
    @Res() res: Response,
    @Body('feedbackDto') body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const feedbackDto = JSON.parse(body);
    const { userId, userType } = res.locals.user;

    if (userType !== 'instructor') {
      return this.responseService.unauthorized(
        res,
        'feedback 작성 권한이 없습니다.',
      );
    }
    if (feedbackDto.feedbackTarget.length === 0) {
      return this.responseService.error(
        res,
        'feedback 대상을 지정해주세요',
        HttpStatus.BAD_REQUEST,
      );
    }

    const feedback = await this.feedbackService.createFeedback(
      userId,
      feedbackDto,
      files,
    );
    if (!feedback) {
      return this.responseService.error(
        res,
        'feedback 생성 실패',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.responseService.success(res, 'feedback 생성 성공', {
      feedbackId: feedback.feedbackId,
    });
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
    description: '이미지 업로드',
    type: EditFeedbackImageDto,
  })
  @ApiResponse({ status: 200, description: 'feedback 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async updateFeedback(
    @Res() res: Response,
    @Param('feedbackId') feedbackId: number,
    @Body('editFeedbackDto') body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const editFeedbackDto = JSON.parse(body);
    const { userId } = res.locals.user;

    await this.feedbackService.updateFeedback(
      userId,
      feedbackId,
      editFeedbackDto,
      files,
    );

    return this.responseService.success(res, 'feedback 수정 성공');
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

    return this.responseService.success(res, 'feedback 삭제 성공');
  }
}
