import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticsRepository } from './statistics.repository';
import { UserBadge } from './entity/user-badge.entity';
import { UserLevel } from './entity/user-level.entity';
import { Member } from 'src/member/entity/member.entity';
import { FeedbackTarget } from 'src/feedback/entity/feedback-target.entity';
import { Community } from 'src/community/entity/community.entity';
import { CommunityComment } from 'src/community/entity/community-comment.entity';
import { Feedback } from 'src/feedback/entity/feedback.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Users } from 'src/users/entity/users.entity';
import { ResponseModule } from 'src/common/response/response.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBadge,
      UserLevel,
      Member,
      FeedbackTarget,
      Community,
      CommunityComment,
      Feedback,
      Lecture,
      Users,
    ]),
    ResponseModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository],
  exports: [StatisticsService],
})
export class StatisticsModule {}

