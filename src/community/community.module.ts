import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entity/community.entity';
import { CommunityComment } from './entity/community-comment.entity';
import { CommunityLike } from './entity/community-like.entity';
import { CommentLike } from './entity/comment-like.entity';
import { CommunityRepository } from './community.repository';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { ResponseService } from 'src/common/response/response.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityComment,
      CommunityLike,
      CommentLike,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRepository, ResponseService],
  exports: [CommunityService, CommunityRepository],
})
export class CommunityModule {}
