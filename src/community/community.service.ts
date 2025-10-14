import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  // 게시글 관련 메서드
  async createCommunity(
    userId: number,
    createCommunityDto: CreateCommunityDto,
  ) {
    const { tags, ...communityData } = createCommunityDto;

    // 게시글 생성
    const community = await this.communityRepository.createCommunity(
      userId,
      communityData,
    );

    // 태그가 있으면 연결
    if (tags && tags.length > 0) {
      await this.communityRepository.attachTagsToCommunity(
        community.communityId,
        tags,
      );
    }

    return community;
  }

  async findAllCommunities(page: number = 1, limit: number = 10) {
    const { communities, total } =
      await this.communityRepository.findAllCommunities(page, limit);

    return {
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCommunityById(communityId: number, userId?: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);

    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 조회수 증가
    await this.communityRepository.incrementViewCount(communityId);

    // 좋아요 여부 확인 (로그인한 사용자인 경우)
    let isLiked = false;
    if (userId) {
      isLiked = await this.communityRepository.checkCommunityLike(
        userId,
        communityId,
      );
    }

    // 댓글 가져오기
    const comments =
      await this.communityRepository.findCommentsByCommunityId(communityId);

    return {
      ...community,
      isLiked,
      comments,
    };
  }

  async updateCommunity(
    communityId: number,
    userId: number,
    updateCommunityDto: UpdateCommunityDto,
  ) {
    const community =
      await this.communityRepository.findCommunityById(communityId);

    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (community.user.userId !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    const { tags, ...updateData } = updateCommunityDto;

    // 게시글 업데이트
    const updatedCommunity = await this.communityRepository.updateCommunity(
      communityId,
      updateData,
    );

    // 태그가 포함되어 있으면 업데이트
    if (tags !== undefined) {
      await this.communityRepository.updateCommunityTags(communityId, tags);
    }

    return updatedCommunity;
  }

  async deleteCommunity(communityId: number, userId: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);

    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (community.user.userId !== userId) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    await this.communityRepository.deleteCommunity(communityId);
    return { message: '게시글이 삭제되었습니다.' };
  }

  // 댓글 관련 메서드
  async createComment(
    communityId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // 게시글 존재 확인
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return await this.communityRepository.createComment(
      userId,
      communityId,
      createCommentDto.content,
      createCommentDto.parentCommentId,
    );
  }

  async getComments(communityId: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return await this.communityRepository.findCommentsByCommunityId(
      communityId,
    );
  }

  async updateComment(commentId: number, userId: number, content: string) {
    const comment = await this.communityRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.userId !== userId) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    return await this.communityRepository.updateComment(commentId, content);
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.communityRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.userId !== userId) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.communityRepository.deleteComment(commentId);
    return { message: '댓글이 삭제되었습니다.' };
  }

  // 좋아요 관련 메서드
  async toggleCommunityLike(communityId: number, userId: number) {
    const community =
      await this.communityRepository.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const isLiked = await this.communityRepository.toggleCommunityLike(
      userId,
      communityId,
    );
    return { isLiked };
  }

  async toggleCommentLike(commentId: number, userId: number) {
    const comment = await this.communityRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const isLiked = await this.communityRepository.toggleCommentLike(
      userId,
      commentId,
    );
    return { isLiked };
  }

  // 태그 및 카테고리 관련 메서드
  async getCommunitiesByCategory(
    category: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const { communities, total } =
      await this.communityRepository.findCommunitiesByCategory(
        category as any,
        page,
        limit,
      );

    return {
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCommunitiesByTags(
    tags: string[],
    page: number = 1,
    limit: number = 10,
  ) {
    const { communities, total } =
      await this.communityRepository.findCommunitiesByTags(tags, page, limit);

    return {
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPopularTags(limit: number = 20) {
    return await this.communityRepository.getPopularTags(limit);
  }

  async searchTags(query: string, limit: number = 10) {
    return await this.communityRepository.searchTags(query, limit);
  }

  async getCategoryStats() {
    return await this.communityRepository.getCategoryStats();
  }
}
