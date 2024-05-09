import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedbackTargetRepository {
  constructor(
    @InjectRepository(FeedbackTarget)
    private readonly feedbackTargetRepository: Repository<FeedbackTarget>,
  ) {}

  /* feedbackTarget 생성 */
  async createFeedbackTarget(
    feedbackId: number,
    userId: number,
  ): Promise<FeedbackTarget> {
    return await this.feedbackTargetRepository.query(
      'CALL CREATE_FEEDBACK_TARGET(?, ?)',
      [feedbackId, userId],
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
  async deleteFeedbackTarget(feedbackId: number): Promise<void> {
    await this.feedbackTargetRepository.query(
      'CALL DELETE_FEEDBACK_TARGET(?)',
      [feedbackId],
    );
  }
}
