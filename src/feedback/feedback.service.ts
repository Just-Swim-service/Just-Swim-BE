import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { Feedback } from './entity/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';
import { FeedbackTargetRepository } from './feedbackTarget.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly feedbackTargetRepository: FeedbackTargetRepository,
    private readonly dataSource: DataSource,
  ) {}

  /* 강사용 전체 feedback 조회(feedbackDeletedAt is null) */
  async getAllFeedbackByInstructor(userId: number): Promise<Feedback[]> {
    const feedbacks =
      await this.feedbackRepository.getAllFeedbackByInstructor(userId);

    return feedbacks;
  }

  /* customer 개인 feedback 전체 조회 */
  async getAllFeedbackByCustomer(userId: number): Promise<Feedback[]> {
    const feedbacks =
      await this.feedbackRepository.getAllFeedbackByCustomer(userId);

    return feedbacks;
  }

  /* feedback 상세 조회 */
  async getFeedbackByPk(userId: number, feedbackId: number) {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (!feedback) {
      throw new NotFoundException('존재하지 않는 피드백입니다.');
    }
    const feedbackTargetList =
      await this.feedbackTargetRepository.getFeedbackTargetByFeedbackId(
        feedbackId,
      );

    // instructor
    if (feedback.user && feedback.user.userId === userId) {
      return { feedback, feedbackTargetList };
    }
    // member
    if (
      feedbackTargetList.some(
        (feedbackTarget) =>
          feedbackTarget.user && feedbackTarget.user.userId === userId,
      )
    ) {
      return feedback;
    }
  }

  /* feedback 생성 */
  async createFeedback(
    userId: number,
    feedbackDto: FeedbackDto,
  ): Promise<Feedback> {
    return await this.feedbackRepository.createFeedback(userId, feedbackDto);
  }

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<void> {
    if (feedbackTarget.includes('/')) {
      const targets = feedbackTarget.split('/');

      for (let i = 0; i < targets.length; i++) {
        const [lectureIdStr, userIdsStr] = targets[i].split(':');
        const lectureId = parseInt(lectureIdStr.trim());

        // userIds 문자열을 배열로 변환하고 정수로 파싱
        const userIds = userIdsStr.split(',').map((id) => parseInt(id.trim()));

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
  }

  /* feedback 수정 */
  async updateFeedback(
    userId: number,
    feedbackId: number,
    editFeedbackDto: EditFeedbackDto,
  ): Promise<void> {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (feedback.user && feedback.user.userId !== userId) {
      throw new UnauthorizedException('feedback 수정 권한이 없습니다.');
    }

    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // feedback 내용과 feedbackTargetList 동시에 업데이트
      if (feedback.feedbackTargetList !== editFeedbackDto.feedbackTarget) {
        await Promise.all([
          this.feedbackRepository.updateFeedback(feedbackId, editFeedbackDto),
          this.updateFeedbackTarget(feedbackId, editFeedbackDto.feedbackTarget),
        ]);
      } else {
        // feedbackTargetList 변경 내용이 없으면 feedback만 수정
        await this.feedbackRepository.updateFeedback(
          feedbackId,
          editFeedbackDto,
        );
      }
      // 정상적으로 끝났을 경우 commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // error 발생 시 트랜잭션 rollback
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('feedback 수정 실패');
    } finally {
      // 끝났을 경우 queryRunner 해제
      await queryRunner.release();
    }
  }

  /* feedbackTarget 수정 */
  async updateFeedbackTarget(
    feedbackId: number,
    feedbackTarget: string,
  ): Promise<void> {
    if (feedbackTarget.includes('/')) {
      await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
      const targets = feedbackTarget.split('/');

      for (let i = 0; i < targets.length; i++) {
        const [lectureIdStr, userIdsStr] = targets[i].split(':');
        const lectureId = parseInt(lectureIdStr.trim());

        // userIds 문자열을 배열로 변환하고 정수로 파싱
        const userIds = userIdsStr.split(',').map((id) => parseInt(id.trim()));

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
      await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
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
  }

  /* feedback 삭제(softDelete) */
  async softDeleteFeedback(userId: number, feedbackId: number): Promise<void> {
    const feedback = await this.feedbackRepository.getFeedbackByPk(feedbackId);
    if (feedback.user && feedback.user.userId !== userId) {
      throw new UnauthorizedException('feedback 삭제 권한이 없습니다.');
    }

    // DB 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // feedback 내용과 feedbackTargetList 동시에 삭제
      await Promise.all([
        this.feedbackRepository.softDeleteFeedback(feedbackId),
        this.deleteFeedbackTarget(feedbackId),
      ]);
      // 정상적으로 끝났을 경우 commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // error 발생 시 트랜잭션 rollback
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('feedback 삭제 실패');
    } finally {
      // 끝났을 경우 queryRunner 해제
      await queryRunner.release();
    }
  }

  /* feedbackTarget 삭제 */
  async deleteFeedbackTarget(feedbackId: number): Promise<void> {
    await this.feedbackTargetRepository.deleteFeedbackTarget(feedbackId);
  }
}
