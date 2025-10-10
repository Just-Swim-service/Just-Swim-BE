import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entity/community.entity';
import { CommunityComment } from './entity/community-comment.entity';
import { CommunityLike } from './entity/community-like.entity';
import { CommentLike } from './entity/comment-like.entity';
import { CreateCommunityDto } from './dto/create-community.dto';

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
      relations: ['user', 'images', 'comments', 'likes'],
      order: { communityCreatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { communities, total };
  }

  async findCommunityById(communityId: number): Promise<Community> {
    return await this.communityRepository.findOne({
      where: { communityId, communityDeletedAt: null },
      relations: ['user', 'images', 'comments', 'likes'],
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
    return await this.commentRepository.find({
      where: {
        community: { communityId },
        commentDeletedAt: null,
        parentComment: null, // 대댓글이 아닌 일반 댓글만 조회
      },
      relations: ['user', 'replies', 'replies.user', 'likes'],
      order: {
        commentCreatedAt: 'ASC',
        replies: {
          commentCreatedAt: 'ASC',
        },
      },
    });
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
}
