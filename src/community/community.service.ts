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

  // 검색 관련 메서드
  async searchCommunities(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
  ) {
    const { communities, total } =
      await this.communityRepository.searchCommunities(
        query,
        page,
        limit,
        sortBy,
      );

    // 검색 결과에 하이라이팅 적용
    const highlightedCommunities = this.applyHighlightingToCommunities(
      communities,
      query,
    );

    return {
      communities: highlightedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchQuery: query,
      sortBy,
    };
  }

  async advancedSearchCommunities(
    searchParams: {
      query?: string;
      category?: string;
      tags?: string[];
      startDate?: string;
      endDate?: string;
      minLikes?: number;
      minComments?: number;
      sortBy?:
        | 'recent'
        | 'popular'
        | 'relevance'
        | 'likes'
        | 'comments'
        | 'views';
    },
    page: number = 1,
    limit: number = 10,
  ) {
    const { query, category } = searchParams;

    // 날짜 문자열을 Date 객체로 변환하고 category를 CategoryType으로 변환
    const processedParams = {
      ...searchParams,
      category: category as any, // CategoryType으로 캐스팅
      startDate: searchParams.startDate
        ? new Date(searchParams.startDate)
        : undefined,
      endDate: searchParams.endDate
        ? new Date(searchParams.endDate)
        : undefined,
    };

    const { communities, total } =
      await this.communityRepository.advancedSearchCommunities(
        processedParams,
        page,
        limit,
      );

    // 검색어가 있으면 하이라이팅 적용
    const highlightedCommunities = query
      ? this.applyHighlightingToCommunities(communities, query)
      : communities;

    return {
      communities: highlightedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchParams: processedParams,
    };
  }

  // 관련 태그 추천
  async getRelatedTags(query: string, limit: number = 10) {
    return await this.communityRepository.getRelatedTags(query, limit);
  }

  // 검색어 자동완성
  async getSearchSuggestions(query: string, limit: number = 5) {
    return await this.communityRepository.getSearchSuggestions(query, limit);
  }

  // 검색 결과 하이라이팅을 위한 유틸리티 메서드
  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // 검색 결과에 하이라이팅 적용
  applyHighlightingToCommunities(communities: any[], searchQuery: string) {
    if (!searchQuery) return communities;

    return communities.map((community) => ({
      ...community,
      title: this.highlightSearchTerm(community.title, searchQuery),
      content: this.highlightSearchTerm(community.content, searchQuery),
      // 태그에도 하이라이팅 적용
      communityTags: community.communityTags?.map((ct: any) => ({
        ...ct,
        tag: {
          ...ct.tag,
          tagName: this.highlightSearchTerm(ct.tag.tagName, searchQuery),
        },
      })),
    }));
  }
}
