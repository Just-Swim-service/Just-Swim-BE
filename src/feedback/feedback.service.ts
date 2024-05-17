import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { Feedback } from './entity/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { FeedbackTargetRepository } from './feedbackTarget.repository';
import { MyLogger } from 'src/common/logger/logger.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
    private readonly logger: MyLogger,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(userId: number): Promise<Feedback[]> {
    try {
      const feedbacks =
        await this.feedbackRepository.getAllFeedbackByInstructor(userId);

      return feedbacks;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '강사가 작성한 전체 feedback 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(feedbackId: number): Promise<Feedback> {
    try {
      const feedback =
        await this.feedbackRepository.getFeedbackByPk(feedbackId);
      return feedback;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedback 상세 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
  ): Promise<Feedback> {
    try {
      return await this.feedbackRepository.createFeedback(userId, feedbackDto);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedback 생성 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<void> {
    try {
      if (feedbackTarget.includes(',')) {
        const userIds = feedbackTarget
          .split(',')
          .map((id) => parseInt(id.trim()));

        // for 루프를 사용하여 각 사용자 ID에 대해 데이터베이스에 피드백 대상을 추가
        for (let i = 0; i < userIds.length; i++) {
          const userId = userIds[i]; // 배열의 인덱스를 사용하여 현재 userId를 얻음

          if (!isNaN(userId)) {
            // 유효한 숫자인지 확인
            await this.feedbackTargetRepository.createFeedbackTarget(
              feedbackId,
              userId,
            );
          }
        }
      } else {
        const userId = parseInt(feedbackTarget);
        await this.feedbackTargetRepository.createFeedbackTarget(
          feedbackId,
          userId,
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedbackTarget 생성 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedback 수정 */
  async updateFeedback(
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
  ): Promise<void> {
    try {
      await this.feedbackRepository.updateFeedback(feedbackId, editFeedbackDto);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedback 수정 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedbackTarget 수정 */
  async updateFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<void> {
    try {
      if (feedbackTarget.includes(',')) {
        await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
        const userIds = feedbackTarget
          .split(',')
          .map((id) => parseInt(id.trim()));

        for (let i = 0; i < userIds.length; i++) {
          const userId = userIds[i];

          if (!isNaN(userId)) {
            await this.feedbackTargetRepository.updateFeedbackTarget(
              feedbackId,
              userId,
            );
          }
        }
      } else {
        const userId = parseInt(feedbackTarget);
        await this.feedbackTargetRepository.updateFeedbackTarget(
          feedbackId,
          userId,
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedbackTarget 수정 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(feedbackId: number): Promise<void> {
    try {
      await this.feedbackRepository.softDeleteFeedback(feedbackId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedback 삭제 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedbackTarget 삭제 */
  async deleteFeedbackTarget(feedbackId: number): Promise<void> {
    try {
      await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'feedbackTarget 삭제 중 오류가 발생했습니다.',
      );
    }
  }
}
