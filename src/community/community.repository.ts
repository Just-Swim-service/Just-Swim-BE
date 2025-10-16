import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Community } from './entity/community.entity';
import { CommunityComment } from './entity/community-comment.entity';
import { CommunityLike } from './entity/community-like.entity';
import { CommentLike } from './entity/comment-like.entity';
import { Tag } from './entity/tag.entity';
import { CommunityTag } from './entity/community-tag.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CategoryType } from './enum/category-type.enum';

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityComment)
    private readonly commentRepository: Repository<CommunityComment>,
    @InjectRepository(CommunityLike)
    private readonly communityLikeRepository: Repository<CommunityLike>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(CommunityTag)
    private readonly communityTagRepository: Repository<CommunityTag>,
  ) {}

  // 게시글 관련 메서드
  async createCommunity(
    userId: number,
    createCommunityDto: CreateCommunityDto,
  ): Promise<Community> {
    const community = this.communityRepository.create({
      user: { userId },
      ...createCommunityDto,
    });
    return await this.communityRepository.save(community);
  }

  async findAllCommunities(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ communities: Community[]; total: number }> {
    const [communities, total] = await this.communityRepository.findAndCount({
      where: { communityDeletedAt: null },
      relations: [
        'user',
        'images',
        'comments',
        'likes',
        'communityTags',
        'communityTags.tag',
      ],
      order: { communityCreatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { communities, total };
  }

  async findCommunityById(communityId: number): Promise<Community> {
    return await this.communityRepository.findOne({
      where: { communityId, communityDeletedAt: null },
      relations: [
        'user',
        'images',
        'comments',
        'likes',
        'communityTags',
        'communityTags.tag',
      ],
    });
  }

  async updateCommunity(
    communityId: number,
    updateData: any,
  ): Promise<Community> {
    await this.communityRepository.update(communityId, updateData);
    return await this.findCommunityById(communityId);
  }

  async deleteCommunity(communityId: number): Promise<void> {
    await this.communityRepository.softDelete(communityId);
  }

  async incrementViewCount(communityId: number): Promise<void> {
    await this.communityRepository.increment({ communityId }, 'viewCount', 1);
  }

  // 댓글 관련 메서드
  async createComment(
    userId: number,
    communityId: number,
    content: string,
    parentCommentId?: number,
  ): Promise<CommunityComment> {
    const newComment = this.commentRepository.create({
      user: { userId },
      community: { communityId },
      content,
    });

    // 대댓글인 경우 parentCommentId 설정
    if (parentCommentId) {
      newComment.parentComment = {
        commentId: parentCommentId,
      } as CommunityComment;
    }

    const savedComment = await this.commentRepository.save(newComment);

    // 게시글의 댓글 수 증가 (일반 댓글만 카운트, 대댓글은 제외)
    if (!parentCommentId) {
      await this.communityRepository.increment(
        { communityId },
        'commentCount',
        1,
      );
    }

    return savedComment;
  }

  async findCommentsByCommunityId(
    communityId: number,
  ): Promise<CommunityComment[]> {
    // QueryBuilder를 사용해서 명시적으로 parentCommentId가 null인 댓글만 조회
    return await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .leftJoinAndSelect('comment.likes', 'likes')
      .where('comment.communityId = :communityId', { communityId })
      .andWhere('comment.commentDeletedAt IS NULL')
      .andWhere('comment.parentCommentId IS NULL') // 대댓글이 아닌 일반 댓글만
      .orderBy('comment.commentCreatedAt', 'ASC')
      .addOrderBy('replies.commentCreatedAt', 'ASC')
      .getMany();
  }

  async findCommentById(commentId: number): Promise<CommunityComment> {
    return await this.commentRepository.findOne({
      where: { commentId },
      relations: ['user'],
    });
  }

  async updateComment(
    commentId: number,
    content: string,
  ): Promise<CommunityComment> {
    await this.commentRepository.update(commentId, { content });
    return await this.findCommentById(commentId);
  }

  async deleteComment(commentId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
      relations: ['community', 'parentComment'],
    });

    if (comment) {
      // 게시글의 댓글 수 감소 (일반 댓글만 카운트, 대댓글은 제외)
      if (!comment.parentComment) {
        await this.communityRepository.decrement(
          { communityId: comment.community.communityId },
          'commentCount',
          1,
        );
      }

      await this.commentRepository.softDelete(commentId);
    }
  }

  // 좋아요 관련 메서드
  async toggleCommunityLike(
    userId: number,
    communityId: number,
  ): Promise<boolean> {
    const existingLike = await this.communityLikeRepository.findOne({
      where: { user: { userId }, community: { communityId } },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.communityLikeRepository.remove(existingLike);
      await this.communityRepository.decrement({ communityId }, 'likeCount', 1);
      return false;
    } else {
      // 좋아요 추가
      const like = this.communityLikeRepository.create({
        user: { userId },
        community: { communityId },
      });
      await this.communityLikeRepository.save(like);
      await this.communityRepository.increment({ communityId }, 'likeCount', 1);
      return true;
    }
  }

  async toggleCommentLike(userId: number, commentId: number): Promise<boolean> {
    const existingLike = await this.commentLikeRepository.findOne({
      where: { user: { userId }, comment: { commentId } },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.commentLikeRepository.remove(existingLike);
      await this.commentRepository.decrement({ commentId }, 'likeCount', 1);
      return false;
    } else {
      // 좋아요 추가
      const like = this.commentLikeRepository.create({
        user: { userId },
        comment: { commentId },
      });
      await this.commentLikeRepository.save(like);
      await this.commentRepository.increment({ commentId }, 'likeCount', 1);
      return true;
    }
  }

  async checkCommunityLike(
    userId: number,
    communityId: number,
  ): Promise<boolean> {
    const like = await this.communityLikeRepository.findOne({
      where: { user: { userId }, community: { communityId } },
    });
    return !!like;
  }

  async checkCommentLike(userId: number, commentId: number): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: { user: { userId }, comment: { commentId } },
    });
    return !!like;
  }

  async findOrCreateTag(tagName: string): Promise<Tag> {
    const normalizedTagName = tagName.trim().toLowerCase();

    let tag = await this.tagRepository.findOne({
      where: { tagName: normalizedTagName },
    });

    if (!tag) {
      tag = this.tagRepository.create({ tagName: normalizedTagName });
      tag = await this.tagRepository.save(tag);
    }

    return tag;
  }

  async attachTagsToCommunity(
    communityId: number,
    tagNames: string[],
  ): Promise<void> {
    const uniqueTagNames = [...new Set(tagNames)];

    for (const tagName of uniqueTagNames) {
      const tag = await this.findOrCreateTag(tagName);

      // CommunityTag 연결 테이블에 저장
      const communityTag = this.communityTagRepository.create({
        community: { communityId },
        tag: { tagId: tag.tagId },
      });
      await this.communityTagRepository.save(communityTag);

      // 태그 사용 횟수 증가
      await this.tagRepository.increment({ tagId: tag.tagId }, 'usageCount', 1);
    }
  }

  async updateCommunityTags(
    communityId: number,
    newTagNames: string[],
  ): Promise<void> {
    const existingCommunityTags = await this.communityTagRepository.find({
      where: { community: { communityId } },
      relations: ['tag'],
    });

    for (const communityTag of existingCommunityTags) {
      await this.tagRepository.decrement(
        { tagId: communityTag.tag.tagId },
        'usageCount',
        1,
      );
    }

    // 기존 CommunityTag 삭제
    await this.communityTagRepository.delete({ community: { communityId } });

    // 새 태그 연결
    if (newTagNames && newTagNames.length > 0) {
      await this.attachTagsToCommunity(communityId, newTagNames);
    }
  }

  async getPopularTags(limit: number = 20): Promise<Tag[]> {
    return await this.tagRepository.find({
      where: { usageCount: In([1, 99999999]) },
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }

  async searchTags(query: string, limit: number = 10): Promise<Tag[]> {
    const normalizedQuery = query.trim().toLowerCase();

    return await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.tagName LIKE :query', { query: `%${normalizedQuery}%` })
      .orderBy('tag.usageCount', 'DESC')
      .take(limit)
      .getMany();
  }

  async findCommunitiesByCategory(
    category: CategoryType,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ communities: Community[]; total: number }> {
    const [communities, total] = await this.communityRepository.findAndCount({
      where: { category, communityDeletedAt: null },
      relations: ['user', 'images', 'communityTags', 'communityTags.tag'],
      order: { communityCreatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { communities, total };
  }

  async findCommunitiesByTags(
    tagNames: string[],
    page: number = 1,
    limit: number = 10,
  ): Promise<{ communities: Community[]; total: number }> {
    const normalizedTagNames = tagNames.map((tag) => tag.trim().toLowerCase());

    const queryBuilder = this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.user', 'user')
      .leftJoinAndSelect('community.images', 'images')
      .leftJoinAndSelect('community.communityTags', 'communityTags')
      .leftJoinAndSelect('communityTags.tag', 'tag')
      .where('community.communityDeletedAt IS NULL')
      .andWhere('tag.tagName IN (:...tagNames)', {
        tagNames: normalizedTagNames,
      })
      .orderBy('community.communityCreatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [communities, total] = await queryBuilder.getManyAndCount();

    return { communities, total };
  }

  async getCategoryStats(): Promise<
    { category: CategoryType; count: number }[]
  > {
    const stats = await this.communityRepository
      .createQueryBuilder('community')
      .select('community.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('community.communityDeletedAt IS NULL')
      .groupBy('community.category')
      .getRawMany();

    return stats.map((stat) => ({
      category: stat.category,
      count: parseInt(stat.count),
    }));
  }

  // 통합 검색 메서드
  async searchCommunities(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
  ): Promise<{ communities: Community[]; total: number }> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return { communities: [], total: 0 };
    }

    const queryBuilder = this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.user', 'user')
      .leftJoinAndSelect('community.images', 'images')
      .leftJoinAndSelect('community.communityTags', 'communityTags')
      .leftJoinAndSelect('communityTags.tag', 'tag')
      .where('community.communityDeletedAt IS NULL')
      .andWhere(
        '(community.title LIKE :query OR community.content LIKE :query OR tag.tagName LIKE :query)',
        { query: `%${normalizedQuery}%` },
      );

    // 정렬 옵션
    switch (sortBy) {
      case 'recent':
        queryBuilder.orderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'popular':
        queryBuilder
          .orderBy('community.likeCount', 'DESC')
          .addOrderBy('community.commentCount', 'DESC')
          .addOrderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'relevance':
      default:
        // 관련도 정렬: 제목 매치 > 내용 매치 > 태그 매치 순으로 우선순위
        queryBuilder
          .addSelect(
            `CASE 
              WHEN community.title LIKE :exactQuery THEN 3
              WHEN community.title LIKE :query THEN 2
              WHEN community.content LIKE :query THEN 1
              ELSE 0
            END`,
            'relevance_score',
          )
          .setParameter('exactQuery', normalizedQuery)
          .orderBy('relevance_score', 'DESC')
          .addOrderBy('community.likeCount', 'DESC')
          .addOrderBy('community.communityCreatedAt', 'DESC');
        break;
    }

    const [communities, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { communities, total };
  }

  // 고급 검색 메서드 (필터 포함)
  async advancedSearchCommunities(
    searchParams: {
      query?: string;
      category?: CategoryType;
      tags?: string[];
      startDate?: Date;
      endDate?: Date;
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
  ): Promise<{ communities: Community[]; total: number }> {
    const {
      query,
      category,
      tags,
      startDate,
      endDate,
      minLikes,
      minComments,
      sortBy = 'relevance',
    } = searchParams;

    const queryBuilder = this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.user', 'user')
      .leftJoinAndSelect('community.images', 'images')
      .leftJoinAndSelect('community.communityTags', 'communityTags')
      .leftJoinAndSelect('communityTags.tag', 'tag')
      .where('community.communityDeletedAt IS NULL');

    // 검색어 필터
    if (query && query.trim()) {
      const normalizedQuery = query.trim();
      queryBuilder.andWhere(
        '(community.title LIKE :query OR community.content LIKE :query OR tag.tagName LIKE :query)',
        { query: `%${normalizedQuery}%` },
      );
    }

    // 카테고리 필터
    if (category) {
      queryBuilder.andWhere('community.category = :category', { category });
    }

    // 태그 필터
    if (tags && tags.length > 0) {
      const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
      queryBuilder.andWhere('tag.tagName IN (:...tags)', {
        tags: normalizedTags,
      });
    }

    // 날짜 범위 필터
    if (startDate) {
      queryBuilder.andWhere('community.communityCreatedAt >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('community.communityCreatedAt <= :endDate', {
        endDate,
      });
    }

    // 최소 좋아요 수 필터
    if (minLikes !== undefined) {
      queryBuilder.andWhere('community.likeCount >= :minLikes', { minLikes });
    }

    // 최소 댓글 수 필터
    if (minComments !== undefined) {
      queryBuilder.andWhere('community.commentCount >= :minComments', {
        minComments,
      });
    }

    // 정렬 옵션
    switch (sortBy) {
      case 'recent':
        queryBuilder.orderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'popular':
        queryBuilder
          .orderBy('community.likeCount', 'DESC')
          .addOrderBy('community.commentCount', 'DESC')
          .addOrderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'likes':
        queryBuilder
          .orderBy('community.likeCount', 'DESC')
          .addOrderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'comments':
        queryBuilder
          .orderBy('community.commentCount', 'DESC')
          .addOrderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'views':
        queryBuilder
          .orderBy('community.viewCount', 'DESC')
          .addOrderBy('community.communityCreatedAt', 'DESC');
        break;
      case 'relevance':
      default:
        if (query && query.trim()) {
          const normalizedQuery = query.trim();
          queryBuilder
            .addSelect(
              `CASE 
                WHEN community.title LIKE :exactQuery THEN 3
                WHEN community.title LIKE :query THEN 2
                WHEN community.content LIKE :query THEN 1
                ELSE 0
              END`,
              'relevance_score',
            )
            .setParameter('exactQuery', normalizedQuery)
            .orderBy('relevance_score', 'DESC')
            .addOrderBy('community.likeCount', 'DESC')
            .addOrderBy('community.communityCreatedAt', 'DESC');
        } else {
          queryBuilder.orderBy('community.communityCreatedAt', 'DESC');
        }
        break;
    }

    const [communities, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { communities, total };
  }

  // 검색 결과와 관련된 태그 추천
  async getRelatedTags(query: string, limit: number = 10): Promise<Tag[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    // 검색어와 관련된 게시글들의 태그를 찾아서 인기순으로 반환
    return await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.communityTags', 'communityTag')
      .leftJoin('communityTag.community', 'community')
      .where('community.communityDeletedAt IS NULL')
      .andWhere(
        '(community.title LIKE :query OR community.content LIKE :query OR tag.tagName LIKE :query)',
        { query: `%${normalizedQuery}%` },
      )
      .andWhere('tag.tagName != :exactQuery', { exactQuery: normalizedQuery }) // 검색어 자체는 제외
      .groupBy('tag.tagId')
      .addGroupBy('tag.tagName')
      .addGroupBy('tag.usageCount')
      .orderBy('COUNT(communityTag.communityTagId)', 'DESC')
      .addOrderBy('tag.usageCount', 'DESC')
      .take(limit)
      .getMany();
  }

  // 검색어 자동완성을 위한 제안
  async getSearchSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<{ suggestions: string[]; type: 'title' | 'tag' | 'content' }[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery || normalizedQuery.length < 2) {
      return [];
    }

    const suggestions: {
      suggestions: string[];
      type: 'title' | 'tag' | 'content';
    }[] = [];

    // 태그 자동완성
    const tagSuggestions = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.tagName LIKE :query', { query: `%${normalizedQuery}%` })
      .orderBy('tag.usageCount', 'DESC')
      .take(limit)
      .getMany();

    if (tagSuggestions.length > 0) {
      suggestions.push({
        suggestions: tagSuggestions.map((tag) => tag.tagName),
        type: 'tag',
      });
    }

    // 제목 자동완성 (고유한 제목만)
    const titleSuggestions = await this.communityRepository
      .createQueryBuilder('community')
      .select('DISTINCT community.title', 'title')
      .where('community.communityDeletedAt IS NULL')
      .andWhere('community.title LIKE :query', {
        query: `%${normalizedQuery}%`,
      })
      .orderBy('community.likeCount', 'DESC')
      .take(limit)
      .getRawMany();

    if (titleSuggestions.length > 0) {
      suggestions.push({
        suggestions: titleSuggestions.map((item) => item.title),
        type: 'title',
      });
    }

    return suggestions;
  }
}
