import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommunityRepository } from './community.repository';
import { Community } from './entity/community.entity';
import { CommunityComment } from './entity/community-comment.entity';
import { CommunityLike } from './entity/community-like.entity';
import { CommentLike } from './entity/comment-like.entity';
import { Repository } from 'typeorm';
import {
  mockCommunity,
  mockCommunityComment,
  mockCommunityLike,
  mockCommentLike,
} from 'src/common/mocks/mock-community.repository';

describe('CommunityRepository', () => {
  let repository: CommunityRepository;
  let communityRepo: Repository<Community>;
  let commentRepo: Repository<CommunityComment>;
  let communityLikeRepo: Repository<CommunityLike>;
  let commentLikeRepo: Repository<CommentLike>;

  const mockCommunityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    remove: jest.fn(),
  };

  const mockCommunityLikeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockCommentLikeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    // 모든 mock 초기화
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityRepository,
        {
          provide: getRepositoryToken(Community),
          useValue: mockCommunityRepository,
        },
        {
          provide: getRepositoryToken(CommunityComment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(CommunityLike),
          useValue: mockCommunityLikeRepository,
        },
        {
          provide: getRepositoryToken(CommentLike),
          useValue: mockCommentLikeRepository,
        },
      ],
    }).compile();

    repository = module.get<CommunityRepository>(CommunityRepository);
    communityRepo = module.get<Repository<Community>>(
      getRepositoryToken(Community),
    );
    commentRepo = module.get<Repository<CommunityComment>>(
      getRepositoryToken(CommunityComment),
    );
    communityLikeRepo = module.get<Repository<CommunityLike>>(
      getRepositoryToken(CommunityLike),
    );
    commentLikeRepo = module.get<Repository<CommentLike>>(
      getRepositoryToken(CommentLike),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createCommunity', () => {
    it('should create a community post', async () => {
      const userId = 1;
      const createCommunityDto = {
        title: 'Test Post',
        content: 'Test content',
        workoutData: { workoutTime: '30분' },
      };

      mockCommunityRepository.create.mockReturnValue(mockCommunity);
      mockCommunityRepository.save.mockResolvedValue(mockCommunity);

      const result = await repository.createCommunity(
        userId,
        createCommunityDto,
      );

      expect(mockCommunityRepository.create).toHaveBeenCalledWith({
        user: { userId },
        ...createCommunityDto,
      });
      expect(mockCommunityRepository.save).toHaveBeenCalledWith(mockCommunity);
      expect(result).toEqual(mockCommunity);
    });
  });

  describe('findAllCommunities', () => {
    it('should return paginated communities', async () => {
      mockCommunityRepository.findAndCount.mockResolvedValue([
        [mockCommunity],
        1,
      ]);

      const result = await repository.findAllCommunities(1, 10);

      expect(mockCommunityRepository.findAndCount).toHaveBeenCalledWith({
        where: { communityDeletedAt: null },
        relations: ['user', 'images', 'comments', 'likes'],
        order: { communityCreatedAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result.communities).toEqual([mockCommunity]);
      expect(result.total).toBe(1);
    });
  });

  describe('findCommunityById', () => {
    it('should return community by id', async () => {
      const communityId = 1;

      mockCommunityRepository.findOne.mockResolvedValue(mockCommunity);

      const result = await repository.findCommunityById(communityId);

      expect(mockCommunityRepository.findOne).toHaveBeenCalledWith({
        where: { communityId, communityDeletedAt: null },
        relations: ['user', 'images', 'comments', 'likes'],
      });
      expect(result).toEqual(mockCommunity);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const userId = 1;
      const communityId = 1;
      const content = 'Test comment';

      const newComment = {
        user: { userId },
        community: { communityId },
        content,
      };

      mockCommentRepository.create.mockReturnValue(newComment);
      mockCommentRepository.save.mockResolvedValue(mockCommunityComment);
      mockCommunityRepository.increment.mockResolvedValue(undefined);

      const result = await repository.createComment(
        userId,
        communityId,
        content,
      );

      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        user: { userId },
        community: { communityId },
        content,
      });
      expect(mockCommentRepository.save).toHaveBeenCalledWith(newComment);
      expect(mockCommunityRepository.increment).toHaveBeenCalledWith(
        { communityId },
        'commentCount',
        1,
      );
      expect(result).toEqual(mockCommunityComment);
    });

    it('should create a reply comment without incrementing comment count', async () => {
      const userId = 1;
      const communityId = 1;
      const content = 'Test reply';
      const parentCommentId = 1;

      const newComment = {
        user: { userId },
        community: { communityId },
        content,
        parentComment: { commentId: parentCommentId } as CommunityComment,
      };

      // mock 초기화
      mockCommunityRepository.increment.mockClear();
      mockCommentRepository.create.mockReturnValue(newComment);
      mockCommentRepository.save.mockResolvedValue(mockCommunityComment);

      const result = await repository.createComment(
        userId,
        communityId,
        content,
        parentCommentId,
      );

      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        user: { userId },
        community: { communityId },
        content,
      });
      expect(mockCommentRepository.save).toHaveBeenCalledWith(newComment);
      // 대댓글 생성 시에는 댓글 수가 증가하지 않아야 함
      expect(mockCommunityRepository.increment).not.toHaveBeenCalled();
      expect(result).toEqual(mockCommunityComment);
    });
  });

  describe('findCommentsByCommunityId', () => {
    it('should return only main comments (not replies)', async () => {
      const communityId = 1;
      const mockComments = [mockCommunityComment];

      mockCommentRepository.find.mockResolvedValue(mockComments);

      const result = await repository.findCommentsByCommunityId(communityId);

      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockComments);
    });
  });

  describe('deleteComment', () => {
    it('should delete a main comment and decrement comment count', async () => {
      const commentId = 1;
      const mockComment = {
        commentId: 1,
        community: { communityId: 1 },
        parentComment: null, // 일반 댓글
      };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.softDelete.mockResolvedValue(undefined);
      mockCommunityRepository.decrement.mockResolvedValue(undefined);

      await repository.deleteComment(commentId);

      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { commentId },
        relations: ['community', 'parentComment'],
      });
      expect(mockCommentRepository.softDelete).toHaveBeenCalledWith(commentId);
      expect(mockCommunityRepository.decrement).toHaveBeenCalledWith(
        { communityId: 1 },
        'commentCount',
        1,
      );
    });

    it('should delete a reply comment without decrementing comment count', async () => {
      const commentId = 2;
      const mockComment = {
        commentId: 2,
        community: { communityId: 1 },
        parentComment: { commentId: 1 }, // 대댓글
      };

      // mock 초기화
      mockCommunityRepository.decrement.mockClear();
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.softDelete.mockResolvedValue(undefined);

      await repository.deleteComment(commentId);

      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { commentId },
        relations: ['community', 'parentComment'],
      });
      expect(mockCommentRepository.softDelete).toHaveBeenCalledWith(commentId);
      // 대댓글 삭제 시에는 댓글 수가 감소하지 않아야 함
      expect(mockCommunityRepository.decrement).not.toHaveBeenCalled();
    });
  });

  describe('toggleCommunityLike', () => {
    it('should add like when not exists', async () => {
      const userId = 1;
      const communityId = 1;

      mockCommunityLikeRepository.findOne.mockResolvedValue(null);
      mockCommunityLikeRepository.create.mockReturnValue({
        userId,
        communityId,
      });
      mockCommunityLikeRepository.save.mockResolvedValue({
        userId,
        communityId,
      });
      mockCommunityRepository.increment.mockResolvedValue(undefined);

      const result = await repository.toggleCommunityLike(userId, communityId);

      expect(mockCommunityLikeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId }, community: { communityId } },
      });
      expect(mockCommunityLikeRepository.create).toHaveBeenCalledWith({
        user: { userId },
        community: { communityId },
      });
      expect(mockCommunityRepository.increment).toHaveBeenCalledWith(
        { communityId },
        'likeCount',
        1,
      );
      expect(result).toBe(true);
    });

    it('should remove like when exists', async () => {
      const userId = 1;
      const communityId = 1;

      mockCommunityLikeRepository.findOne.mockResolvedValue(mockCommunityLike);
      mockCommunityLikeRepository.remove.mockResolvedValue(mockCommunityLike);
      mockCommunityRepository.decrement.mockResolvedValue(undefined);

      const result = await repository.toggleCommunityLike(userId, communityId);

      expect(mockCommunityLikeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId }, community: { communityId } },
      });
      expect(mockCommunityLikeRepository.remove).toHaveBeenCalledWith(
        mockCommunityLike,
      );
      expect(mockCommunityRepository.decrement).toHaveBeenCalledWith(
        { communityId },
        'likeCount',
        1,
      );
      expect(result).toBe(false);
    });
  });

  describe('checkCommunityLike', () => {
    it('should return true when like exists', async () => {
      const userId = 1;
      const communityId = 1;

      mockCommunityLikeRepository.findOne.mockResolvedValue(mockCommunityLike);

      const result = await repository.checkCommunityLike(userId, communityId);

      expect(mockCommunityLikeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId }, community: { communityId } },
      });
      expect(result).toBe(true);
    });

    it('should return false when like does not exist', async () => {
      const userId = 1;
      const communityId = 1;

      mockCommunityLikeRepository.findOne.mockResolvedValue(null);

      const result = await repository.checkCommunityLike(userId, communityId);

      expect(result).toBe(false);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count', async () => {
      const communityId = 1;

      mockCommunityRepository.increment.mockResolvedValue(undefined);

      await repository.incrementViewCount(communityId);

      expect(mockCommunityRepository.increment).toHaveBeenCalledWith(
        { communityId },
        'viewCount',
        1,
      );
    });
  });
});
