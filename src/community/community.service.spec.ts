import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { CommunityRepository } from './community.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  mockCommunity,
  mockCommunityComment,
  MockCommunityRepository,
} from 'src/common/mocks/mock-community.repository';

describe('CommunityService', () => {
  let service: CommunityService;
  let repository: CommunityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: CommunityRepository,
          useValue: MockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    repository = module.get<CommunityRepository>(CommunityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCommunity', () => {
    it('should create a community post', async () => {
      const userId = 1;
      const createCommunityDto: CreateCommunityDto = {
        title: 'Test Post',
        content: 'Test content',
        workoutData: { workoutTime: '30분' },
      };

      MockCommunityRepository.createCommunity.mockResolvedValue(mockCommunity);

      const result = await service.createCommunity(userId, createCommunityDto);

      expect(repository.createCommunity).toHaveBeenCalledWith(
        userId,
        createCommunityDto,
      );
      expect(result).toEqual(mockCommunity);
    });
  });

  describe('findAllCommunities', () => {
    it('should return paginated communities', async () => {
      MockCommunityRepository.findAllCommunities.mockResolvedValue({
        communities: [mockCommunity],
        total: 1,
      });

      const result = await service.findAllCommunities(1, 10);

      expect(repository.findAllCommunities).toHaveBeenCalledWith(1, 10);
      expect(result.communities).toEqual([mockCommunity]);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('findCommunityById', () => {
    it('should return community with comments and like status', async () => {
      const communityId = 1;
      const userId = 1;

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.checkCommunityLike.mockResolvedValue(true);
      MockCommunityRepository.findCommentsByCommunityId.mockResolvedValue([
        mockCommunityComment,
      ]);
      MockCommunityRepository.incrementViewCount.mockResolvedValue(undefined);

      const result = await service.findCommunityById(communityId, userId);

      expect(repository.findCommunityById).toHaveBeenCalledWith(communityId);
      expect(repository.incrementViewCount).toHaveBeenCalledWith(communityId);
      expect(repository.checkCommunityLike).toHaveBeenCalledWith(
        userId,
        communityId,
      );
      expect(result.isLiked).toBe(true);
      expect(result.comments).toEqual([mockCommunityComment]);
    });

    it('should throw NotFoundException when community not found', async () => {
      MockCommunityRepository.findCommunityById.mockResolvedValue(null);

      await expect(service.findCommunityById(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCommunity', () => {
    it('should update community when user is owner', async () => {
      const communityId = 1;
      const userId = 1;
      const updateDto: UpdateCommunityDto = { title: 'Updated Title' };

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.updateCommunity.mockResolvedValue({
        ...mockCommunity,
        ...updateDto,
      });

      const result = await service.updateCommunity(
        communityId,
        userId,
        updateDto,
      );

      expect(repository.findCommunityById).toHaveBeenCalledWith(communityId);
      expect(repository.updateCommunity).toHaveBeenCalledWith(
        communityId,
        updateDto,
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const communityId = 1;
      const userId = 2;
      const updateDto: UpdateCommunityDto = { title: 'Updated Title' };

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );

      await expect(
        service.updateCommunity(communityId, userId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteCommunity', () => {
    it('should delete community when user is owner', async () => {
      const communityId = 1;
      const userId = 1;

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.deleteCommunity.mockResolvedValue(undefined);

      const result = await service.deleteCommunity(communityId, userId);

      expect(repository.findCommunityById).toHaveBeenCalledWith(communityId);
      expect(repository.deleteCommunity).toHaveBeenCalledWith(communityId);
      expect(result.message).toBe('게시글이 삭제되었습니다.');
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const communityId = 1;
      const userId = 2;

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );

      await expect(
        service.deleteCommunity(communityId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const communityId = 1;
      const userId = 1;
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.createComment.mockResolvedValue(
        mockCommunityComment,
      );

      const result = await service.createComment(
        communityId,
        userId,
        createCommentDto,
      );

      expect(repository.findCommunityById).toHaveBeenCalledWith(communityId);
      expect(repository.createComment).toHaveBeenCalledWith(
        userId,
        communityId,
        createCommentDto.content,
        undefined,
      );
      expect(result).toEqual(mockCommunityComment);
    });

    it('should create a reply comment', async () => {
      const communityId = 1;
      const userId = 1;
      const createCommentDto: CreateCommentDto = {
        content: 'Test reply',
        parentCommentId: 1,
      };

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.createComment.mockResolvedValue(
        mockCommunityComment,
      );

      const result = await service.createComment(
        communityId,
        userId,
        createCommentDto,
      );

      expect(repository.createComment).toHaveBeenCalledWith(
        userId,
        communityId,
        createCommentDto.content,
        1,
      );
      expect(result).toEqual(mockCommunityComment);
    });

    it('should throw NotFoundException when community not found', async () => {
      const communityId = 999;
      const userId = 1;
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };

      MockCommunityRepository.findCommunityById.mockResolvedValue(null);

      await expect(
        service.createComment(communityId, userId, createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleCommunityLike', () => {
    it('should toggle community like', async () => {
      const communityId = 1;
      const userId = 1;

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.toggleCommunityLike.mockResolvedValue(true);

      const result = await service.toggleCommunityLike(communityId, userId);

      expect(repository.findCommunityById).toHaveBeenCalledWith(communityId);
      expect(repository.toggleCommunityLike).toHaveBeenCalledWith(
        userId,
        communityId,
      );
      expect(result.isLiked).toBe(true);
    });

    it('should throw NotFoundException when community not found', async () => {
      const communityId = 999;
      const userId = 1;

      MockCommunityRepository.findCommunityById.mockResolvedValue(null);

      await expect(
        service.toggleCommunityLike(communityId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleCommentLike', () => {
    it('should toggle comment like', async () => {
      const commentId = 1;
      const userId = 1;

      MockCommunityRepository.findCommentById.mockResolvedValue(
        mockCommunityComment,
      );
      MockCommunityRepository.toggleCommentLike.mockResolvedValue(true);

      const result = await service.toggleCommentLike(commentId, userId);

      expect(repository.findCommentById).toHaveBeenCalledWith(commentId);
      expect(repository.toggleCommentLike).toHaveBeenCalledWith(
        userId,
        commentId,
      );
      expect(result.isLiked).toBe(true);
    });

    it('should throw NotFoundException when comment not found', async () => {
      const commentId = 999;
      const userId = 1;

      MockCommunityRepository.findCommentById.mockResolvedValue(null);

      await expect(
        service.toggleCommentLike(commentId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
