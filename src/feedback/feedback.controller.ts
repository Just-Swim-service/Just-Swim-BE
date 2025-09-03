import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FeedbackAccessGuard } from 'src/auth/guard/feedback-access.guard';
import { UserTypeGuard, RequireUserType } from 'src/auth/guard/user-type.guard';
import { UserType } from 'src/users/enum/user-type.enum';
import {
  feedbackDetailByCustomer,
  feedbackDetailByInstructor,
  feedbacksByCustomer,
  feedbacksByInstructor,
} from './example/feedback-example';
import { FeedbackImageDto } from 'src/image/dto/feedback-image.dto';
import { ResponseService } from 'src/common/response/response.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { EditFeedbackDto } from './dto/edit-feedback.dto';

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
  @UseGuards(FeedbackAccessGuard)
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
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getFeedbackDetail(
    @Res() res: Response,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
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
  @UseGuards(UserTypeGuard)
  @RequireUserType([UserType.Instructor])
  @ApiOperation({
    summary: 'feedback을 생성 한다',
    description: `수강생을 선택하여 feedback을 남긴다. 
    feedback 이미지는 files로 넘겨주시고 4개까지만 가능합니다.
    feedbackTarget은 lectureId:userId,userId 이런 형태로 넘겨주시면 됩니다.`,
  })
  @ApiBody({
    description: 'feedback 정보와 image 주소를 받는다.',
    type: CreateFeedbackDto,
  })
  @ApiResponse({ status: 200, description: 'feedback 생성 성공' })
  @ApiResponse({ status: 400, description: 'feedback 생성 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async createFeedback(
    @Res() res: Response,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    const { userId } = res.locals.user;

    if (createFeedbackDto.feedbackTarget.length === 0) {
      return this.responseService.error(
        res,
        'feedback 대상을 지정해주세요',
        HttpStatus.BAD_REQUEST,
      );
    }

    const feedback = await this.feedbackService.createFeedback(
      userId,
      createFeedbackDto,
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
  @ApiOperation({
    summary: '작성했던 feedback을 수정한다.',
    description: 'instructor가 본인이 작성한 feedback을 수정한다.',
  })
  @ApiBody({
    description:
      '피드백 정보와 수정된 이미지 주소 배열을 받습니다. 기존 presigned URL 사용은 FE에서 처리됩니다.',
    type: EditFeedbackDto,
  })
  @ApiResponse({ status: 200, description: 'feedback 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async updateFeedback(
    @Res() res: Response,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
    @Body() editFeedbackDto: EditFeedbackDto,
  ) {
    const { userId } = res.locals.user;

    // 파일 이름 추출

    await this.feedbackService.updateFeedback(
      userId,
      feedbackId,
      editFeedbackDto,
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
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
  ) {
    const { userId } = res.locals.user;

    await this.feedbackService.softDeleteFeedback(userId, feedbackId);

    return this.responseService.success(res, 'feedback 삭제 성공');
  }

  /* feedback 이미지 presigned url */
  @Post('feedbackImage/presignedUrl')
  @ApiOperation({
    summary: 'feedback 이미지 관련 presigned url을 보내준다.',
    description: 'feedback 이미지 저장 요청 시 presigned url을 보내준다.',
  })
  @ApiBearerAuth('accessToken')
  async getPresignedUrlsForFeedback(
    @Res() res: Response,
    @Body() feedbackImageDto: FeedbackImageDto,
  ) {
    const { userId, userType } = res.locals.user;

    if (userType !== 'instructor') {
      return this.responseService.unauthorized(
        res,
        'feedback 이미지 저장 권한이 없습니다.',
      );
    }

    const presignedUrls =
      await this.feedbackService.generateFeedbackPresignedUrls(
        userId,
        feedbackImageDto,
      );

    return this.responseService.success(
      res,
      'presigned url 제공 성공',
      presignedUrls,
    );
  }
}
