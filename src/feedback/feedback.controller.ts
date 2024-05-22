import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';
import { DataSource } from 'typeorm';
import {
  feedbackDetailByCustomer,
  feedbackDetailByInstructor,
  feedbacksByCustomer,
  feedbacksByInstructor,
} from './example/feedback-example';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly dataSource: DataSource,
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
  @ApiBearerAuth('accessToken')
  async getAllFeedback(@Res() res: Response) {
    try {
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
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
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
  @ApiBearerAuth('accessToken')
  async getFeedbackDetail(
    @Res() res: Response,
    @Param('feedbackId') feedbackId: number,
  ) {
    try {
      const { userId } = res.locals.user;
      const result = await this.feedbackService.getFeedbackByPk(
        userId,
        feedbackId,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* feedback 생성 */
  @Post()
  @ApiOperation({
    summary: 'feedback을 생성 한다',
    description: '수강생을 선택하여 feedback을 남긴다',
  })
  @ApiResponse({
    status: 200,
    description: 'feedback 생성 성공',
  })
  @ApiBearerAuth('accessToken')
  async createFeedback(@Res() res: Response, @Body() feedbackDto: FeedbackDto) {
    try {
      const { userId, userType } = res.locals.user;

      if (userType !== 'instructor') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'feedback 작성 권한이 없습니다.' });
      }
      if (feedbackDto.feedbackTarget === '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'feedback 대상을 지정해주세요' });
      }

      const feedback = await this.feedbackService.createFeedback(
        userId,
        feedbackDto,
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
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || '서버 오류' });
    }
  }

  /* feedback 수정 */
  //   @Patch(':feedbackId')
  //   @ApiOperation({
  //     summary: '작성했던 feedback을 수정한다.',
  //     description: 'instructor가 본인이 작성한 feedback을 수정한다.',
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'feedback 수정 성공',
  //   })
  //   @ApiBearerAuth('accessToken')
  //   async updateFeedback(
  //     @Res() res: Response,
  //     @Param('feedbackId') feedbackId: number,
  //     @Body() editFeedbackDto: EditFeedbackDto,
  //   ) {
  //     try {
  //       const { userId } = res.locals.user;
  //       const feedback = await this.feedbackService.getFeedbackByPk(
  //         userId,
  //         feedbackId,
  //       );

  //       if (feedback.userId !== userId) {
  //         return res
  //           .status(HttpStatus.UNAUTHORIZED)
  //           .json({ message: 'feedback 수정 권한이 없습니다.' });
  //       }

  //       // DB 트랜잭션 시작
  //       const queryRunner = this.dataSource.createQueryRunner();
  //       await queryRunner.connect();
  //       await queryRunner.startTransaction();

  //       try {
  //         // feedback 내용과 feedbackTargetList 동시에 업데이트
  //         if (feedback.feedbackTargetList !== editFeedbackDto.feedbackTarget) {
  //           const a = await Promise.all([
  //             this.feedbackService.updateFeedback(feedbackId, editFeedbackDto),
  //             this.feedbackService.updateFeedbackTarget(
  //               feedbackId,
  //               editFeedbackDto.feedbackTarget,
  //             ),
  //           ]);
  //         } else {
  //           // feedbackTargetList 변경 내용이 없으면 feedback만 수정
  //           await this.feedbackService.updateFeedback(
  //             feedbackId,
  //             editFeedbackDto,
  //           );
  //         }
  //         // 정상적으로 끝났을 경우 commit
  //         await queryRunner.commitTransaction();
  //       } catch (error) {
  //         // error 발생 시 트랜잭션 rollback
  //         await queryRunner.rollbackTransaction();
  //         throw new HttpException(
  //           'feedback 수정 실패',
  //           HttpStatus.INTERNAL_SERVER_ERROR,
  //         );
  //       } finally {
  //         // 끝났을 경우 queryRunner 해제
  //         await queryRunner.release();
  //       }

  //       return res.status(HttpStatus.OK).json({ message: 'feedback 수정 성공' });
  //     } catch (e) {
  //       console.log(e);
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json({ message: e.message || '서버 오류' });
  //     }
  //   }

  //   /* feedback 삭제(softDelete) */
  //   @Delete(':feedbackId')
  //   @ApiOperation({
  //     summary: 'feedback을 soft delete 한다.',
  //     description: 'feedbackId를 이용하여 해당 feedback을 soft delete한다.',
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'feedback 삭제 성공',
  //   })
  //   @ApiBearerAuth('accessToken')
  //   async softDeleteFeedback(
  //     @Res() res: Response,
  //     @Param('feedbackId') feedbackId: number,
  //   ) {
  //     try {
  //       const { userId } = res.locals.user;
  //       const feedback = await this.feedbackService.getFeedbackByPk(
  //         userId,
  //         feedbackId,
  //       );

  //       if (feedback.userId !== userId) {
  //         return res
  //           .status(HttpStatus.UNAUTHORIZED)
  //           .json({ message: 'feedback 삭제 권한이 없습니다.' });
  //       }

  //       // DB 트랜잭션 시작
  //       const queryRunner = this.dataSource.createQueryRunner();
  //       await queryRunner.connect();
  //       await queryRunner.startTransaction();

  //       try {
  //         // feedback 내용과 feedbackTargetList 동시에 삭제
  //         await Promise.all([
  //           this.feedbackService.softDeleteFeedback(feedbackId),
  //           this.feedbackService.deleteFeedbackTarget(feedbackId),
  //         ]);

  //         // 정상적으로 끝났을 경우 commit
  //         await queryRunner.commitTransaction();
  //       } catch (error) {
  //         // error 발생 시 트랜잭션 rollback
  //         await queryRunner.rollbackTransaction();
  //         throw new HttpException(
  //           'feedback 삭제 실패',
  //           HttpStatus.INTERNAL_SERVER_ERROR,
  //         );
  //       } finally {
  //         // 끝났을 경우 queryRunner 해제
  //         await queryRunner.release();
  //       }

  //       return res.status(HttpStatus.OK).json({ message: 'feedback 삭제 성공' });
  //     } catch (e) {
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json({ message: e.message || '서버 오류' });
  //     }
  //   }
}
