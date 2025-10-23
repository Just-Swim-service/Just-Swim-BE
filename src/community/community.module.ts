import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entity/community.entity';
import { CommunityComment } from './entity/community-comment.entity';
import { CommunityLike } from './entity/community-like.entity';
import { CommunityBookmark } from './entity/community-bookmark.entity';
import { CommentLike } from './entity/comment-like.entity';
import { Tag } from './entity/tag.entity';
import { CommunityTag } from './entity/community-tag.entity';
import { Users } from 'src/users/entity/users.entity';
import { CommunityRepository } from './community.repository';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunitySearchService } from './community-search.service';
import { ResponseService } from 'src/common/response/response.service';
import { SearchService } from 'src/common/search/search.service';
import { SearchModule } from 'src/common/search/search.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { SecurityModule } from 'src/common/security/security.module';
import { ImageModule } from 'src/image/image.module';
import { AwsModule } from 'src/common/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityComment,
      CommunityLike,
      CommunityBookmark,
      CommentLike,
      Tag,
      CommunityTag,
      Users,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    LoggerModule,
    SecurityModule,
    SearchModule,
    ImageModule,
    AwsModule,
  ],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityRepository,
    CommunitySearchService,
    ResponseService,
    {
      provide: 'COMMUNITY_SEARCH_INITIALIZER',
      useFactory: (
        searchService: SearchService,
        communitySearchService: CommunitySearchService,
      ) => {
        // 커뮤니티 검색 서비스를 공통 검색 서비스에 등록
        searchService.registerSearchableService(
          'community',
          communitySearchService,
        );
        return true;
      },
      inject: [SearchService, CommunitySearchService],
    },
  ],
  exports: [CommunityService, CommunityRepository, CommunitySearchService],
})
export class CommunityModule {}
