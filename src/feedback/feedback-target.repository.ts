import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackTarget } from './entity/feedback-target.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedbackTargetRepository {
  constructor(
    @InjectRepository(FeedbackTarget)
    private readonly feedbackTargetRepository: Repository<FeedbackTarget>,
  ) {}

  /* feedbackId를 통해 target 확인 */
  async getFeedbackTargetByFeedbackId(feedbackId: number) {
    return await this.feedbackTargetRepository
      .createQueryBuilder('feedbackTarget')
      .leftJoin('feedbackTarget.user', 'user')
      .leftJoin('member', 'member', 'member.userId = feedbackTarget.userId')
      .leftJoin(
        'lecture',
        'lecture',
        'lecture.lectureId = feedbackTarget.lectureId',
      )
      .select([
        'lecture.lectureTitle AS lectureTitle',
        'feedbackTarget.userId AS memberUserId',
        'member.memberNickname AS memberNickname',
        'user.profileImage AS memberProfileImage',
      ])
      .where('feedbackTarget.feedbackId = :feedbackId', { feedbackId })
      .getRawMany();
  }
}
