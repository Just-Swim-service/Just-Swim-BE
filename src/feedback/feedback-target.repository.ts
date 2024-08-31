import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackTarget } from './entity/feedback-target.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class FeedbackTargetRepository {
  constructor(
    @InjectRepository(FeedbackTarget)
    private readonly feedbackTargetRepository: Repository<FeedbackTarget>,
  ) {}

  /* feedbackId를 통해 target 확인 */
  async getFeedbackTargetByFeedbackId(feedbackId: number) {
    const result = await this.feedbackTargetRepository.query(
      'CALL GET_FEEDBACK_TARGET_BY_FEEDBACKID(?)',
      [feedbackId],
    );

    return result[0];
  }
}
