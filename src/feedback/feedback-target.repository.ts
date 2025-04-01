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
      .leftJoinAndSelect('feedbackTarget.user', 'user')
      .leftJoinAndSelect('feedbackTarget.lecture', 'lecture')
      .leftJoinAndSelect(
        'member',
        'member',
        'member.lectureId = lecture.lectureId AND member.userId = user.userId',
      )
      .select([
        'member.memberId AS memberId',
        'lecture.lectureId AS lectureId',
        'lecture.lectureTitle AS lectureTitle',
        'feedbackTarget.userId AS memberUserId',
        'user.name AS memberName',
        'user.profileImage AS memberProfileImage',
      ])
      .where('feedbackTarget.feedbackId = :feedbackId', { feedbackId })
      .distinct(true)
      .getRawMany();
  }
}
