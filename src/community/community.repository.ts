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
}
