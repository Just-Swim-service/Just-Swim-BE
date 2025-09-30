import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entity/community.entity';
import { CommunityComment } from './entity/community-comment.entity';
import { CommunityLike } from './entity/community-like.entity';
import { CommentLike } from './entity/comment-like.entity';
import { CommunityRepository } from './community.repository';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { ResponseService } from 'src/common/response/response.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { SecurityModule } from 'src/common/security/security.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityComment,
      CommunityLike,
      CommentLike,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    LoggerModule,
    SecurityModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRepository, ResponseService],
  exports: [CommunityService, CommunityRepository],
})
export class CommunityModule {}
