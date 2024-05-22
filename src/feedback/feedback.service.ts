import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(userId: number): Promise<Feedback[]> {
    try {
      const feedbacks =
        await this.feedbackRepository.getAllFeedbackByCustomer(userId);

      return feedbacks;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '개인 feedback 전체 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(userId: number, feedbackId: number) {
    try {
      const feedback =
        await this.feedbackRepository.getFeedbackByPk(feedbackId);
      if (!feedback) {
        throw new NotFoundException('존재하지 않는 피드백입니다.');
      }
      const feedbackTargetList =
        await this.feedbackTargetRepository.getFeedbackTargetByFeedbackId(
          feedbackId,
        );
      // instructor
      if (feedback.userId === userId) {
        return { feedback, feedbackTargetList };
      }
      // member
      if (feedbackTargetList.some((feedbackTarget) => feedbackTarget.userId)) {
        return feedback;
      }
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
      if (feedbackTarget.includes('/')) {
        const targets = feedbackTarget.split('/');

        for (let i = 0; i < targets.length; i++) {
          const [lectureIdStr, userIdsStr] = targets[i].split(':');
          const lectureId = parseInt(lectureIdStr.trim());

          // userIds 문자열을 배열로 변환하고 정수로 파싱
          const userIds = userIdsStr
            .split(',')
            .map((id) => parseInt(id.trim()));

          // 각 lectureId와 userIds에 대해 피드백 대상 생성
          for (let j = 0; j < userIds.length; j++) {
            const userId = userIds[j];
            if (!isNaN(userId)) {
              await this.feedbackTargetRepository.createFeedbackTarget(
                feedbackId,
                lectureId,
                userId,
              );
            }
          }
        }
      } else {
        const [lectureId, userIdStr] = feedbackTarget.split(':');
        if (userIdStr.includes(',')) {
          // userIds 문자열을 배열로 변환하고 정수로 파싱
          const userIds = userIdStr.split(',').map((id) => parseInt(id.trim()));

          for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (!isNaN(userId)) {
              await this.feedbackTargetRepository.createFeedbackTarget(
                feedbackId,
                parseInt(lectureId),
                userId,
              );
            }
          }
        } else {
          const userId = parseInt(userIdStr);
          await this.feedbackTargetRepository.createFeedbackTarget(
            feedbackId,
            parseInt(lectureId),
            userId,
          );
        }
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
