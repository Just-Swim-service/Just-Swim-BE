import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class FeedbackTargetRepository {
  constructor(
    @InjectRepository(FeedbackTarget)
    private readonly feedbackTargetRepository: Repository<FeedbackTarget>,
  ) {}

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    lectureId: number,
    userId: number,
  ): Promise<FeedbackTarget> {
    return await this.feedbackTargetRepository.query(
      'CALL CREATE_FEEDBACK_TARGET(?, ?, ?)',
      [feedbackId, lectureId, userId],
    );
  }

  /* feedbackTarget 수정 */
  async updateFeedbackTarget(
    feedbackId: number,
    userId: number,
  ): Promise<void> {
    await this.feedbackTargetRepository.query(
      'CALL UPDATE_FEEDBACK_TARGET(?, ?)',
      [feedbackId, userId],
    );
  }

  /* feedbackTarget 삭제 */
  async deleteFeedbackTarget(
    feedbackId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.feedbackTargetRepository.queryRunner.manager.query(
      'CALL DELETE_FEEDBACK_TARGET(?)',
      [feedbackId],
    );
  }

  /* feedbackId를 통해 target 확인 */
  async getFeedbackTargetByFeedbackId(
    feedbackId: number,
  ): Promise<FeedbackTarget[]> {
    const result = await this.feedbackTargetRepository.query(
      'CALL GET_FEEDBACK_TARGET_BY_FEEDBACKID(?)',
      [feedbackId],
    );

    return result[0];
  }
}
