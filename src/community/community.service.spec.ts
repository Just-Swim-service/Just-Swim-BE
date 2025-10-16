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

    it('should create a community post with tags', async () => {
      const userId = 1;
      const createCommunityDto: CreateCommunityDto = {
        title: 'Test Post',
        content: 'Test content',
        tags: ['자유형', '평영'],
      };

      MockCommunityRepository.createCommunity.mockResolvedValue(mockCommunity);
      MockCommunityRepository.attachTagsToCommunity.mockResolvedValue(
        undefined,
      );

      const result = await service.createCommunity(userId, createCommunityDto);

      expect(repository.createCommunity).toHaveBeenCalledWith(userId, {
        title: 'Test Post',
        content: 'Test content',
      });
      expect(repository.attachTagsToCommunity).toHaveBeenCalledWith(
        mockCommunity.communityId,
        ['자유형', '평영'],
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

    it('should update community with tags', async () => {
      const communityId = 1;
      const userId = 1;
      const updateDto: UpdateCommunityDto = {
        title: 'Updated Title',
        tags: ['자유형', '초보'],
      };

      MockCommunityRepository.findCommunityById.mockResolvedValue(
        mockCommunity,
      );
      MockCommunityRepository.updateCommunity.mockResolvedValue({
        ...mockCommunity,
        title: 'Updated Title',
      });
      MockCommunityRepository.updateCommunityTags.mockResolvedValue(undefined);

      const result = await service.updateCommunity(
        communityId,
        userId,
        updateDto,
      );

      expect(repository.updateCommunityTags).toHaveBeenCalledWith(communityId, [
        '자유형',
        '초보',
      ]);
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

  // 태그 및 카테고리 관련 테스트
  describe('getCommunitiesByCategory', () => {
    it('should return communities filtered by category', async () => {
      MockCommunityRepository.findCommunitiesByCategory.mockResolvedValue({
        communities: [mockCommunity],
        total: 1,
      });

      const result = await service.getCommunitiesByCategory('운동기록', 1, 10);

      expect(repository.findCommunitiesByCategory).toHaveBeenCalledWith(
        '운동기록',
        1,
        10,
      );
      expect(result.communities).toEqual([mockCommunity]);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getCommunitiesByTags', () => {
    it('should return communities filtered by tags', async () => {
      MockCommunityRepository.findCommunitiesByTags.mockResolvedValue({
        communities: [mockCommunity],
        total: 1,
      });

      const result = await service.getCommunitiesByTags(
        ['자유형', '평영'],
        1,
        10,
      );

      expect(repository.findCommunitiesByTags).toHaveBeenCalledWith(
        ['자유형', '평영'],
        1,
        10,
      );
      expect(result.communities).toEqual([mockCommunity]);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getPopularTags', () => {
    it('should return popular tags', async () => {
      const mockTags = [
        { tagId: 1, tagName: '자유형', usageCount: 10 },
        { tagId: 2, tagName: '평영', usageCount: 8 },
      ];

      MockCommunityRepository.getPopularTags.mockResolvedValue(mockTags);

      const result = await service.getPopularTags(20);

      expect(repository.getPopularTags).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockTags);
    });
  });

  describe('searchTags', () => {
    it('should return tags matching query', async () => {
      const mockTags = [{ tagId: 1, tagName: '자유형', usageCount: 10 }];

      MockCommunityRepository.searchTags.mockResolvedValue(mockTags);

      const result = await service.searchTags('자유', 10);

      expect(repository.searchTags).toHaveBeenCalledWith('자유', 10);
      expect(result).toEqual(mockTags);
    });
  });

  describe('getCategoryStats', () => {
    it('should return category statistics', async () => {
      const mockStats = [
        { category: '운동기록', count: 10 },
        { category: '질문', count: 5 },
      ];

      MockCommunityRepository.getCategoryStats.mockResolvedValue(mockStats);

      const result = await service.getCategoryStats();

      expect(repository.getCategoryStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  // 검색 관련 테스트
  describe('searchCommunities', () => {
    it('should search communities and apply highlighting', async () => {
      const query = '자유형';
      const mockSearchResult = {
        communities: [
          {
            ...mockCommunity,
            title: '자유형 배우기',
            content: '자유형 연습 방법',
            communityTags: [{ tag: { tagName: '자유형', usageCount: 10 } }],
          },
        ],
        total: 1,
      };

      MockCommunityRepository.searchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.searchCommunities(query, 1, 10, 'relevance');

      expect(repository.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'relevance',
      );
      expect(result.communities).toBeDefined();
      expect(result.communities[0].title).toContain('<mark>');
      expect(result.pagination.total).toBe(1);
      expect(result.searchQuery).toBe(query);
    });

    it('should search communities with different sort options', async () => {
      const query = '수영';
      const mockSearchResult = {
        communities: [mockCommunity],
        total: 1,
      };

      MockCommunityRepository.searchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      // 최신순 정렬
      await service.searchCommunities(query, 1, 10, 'recent');
      expect(repository.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'recent',
      );

      // 인기순 정렬
      await service.searchCommunities(query, 1, 10, 'popular');
      expect(repository.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'popular',
      );
    });
  });

  describe('advancedSearchCommunities', () => {
    it('should perform advanced search with filters', async () => {
      const searchParams = {
        query: '자유형',
        category: '수영팁',
        tags: ['자유형', '초보'],
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minLikes: 5,
        minComments: 3,
        sortBy: 'likes' as const,
      };

      const mockSearchResult = {
        communities: [mockCommunity],
        total: 1,
      };

      MockCommunityRepository.advancedSearchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.advancedSearchCommunities(
        searchParams,
        1,
        10,
      );

      expect(repository.advancedSearchCommunities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '자유형',
          category: '수영팁',
          tags: ['자유형', '초보'],
          minLikes: 5,
          minComments: 3,
          sortBy: 'likes',
        }),
        1,
        10,
      );
      expect(result.communities).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });

    it('should handle search without query (filter only)', async () => {
      const searchParams = {
        category: '운동기록',
        minLikes: 10,
      };

      const mockSearchResult = {
        communities: [mockCommunity],
        total: 1,
      };

      MockCommunityRepository.advancedSearchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.advancedSearchCommunities(
        searchParams,
        1,
        10,
      );

      expect(repository.advancedSearchCommunities).toHaveBeenCalled();
      expect(result.communities).toEqual([mockCommunity]);
    });
  });

  describe('getRelatedTags', () => {
    it('should return related tags for search query', async () => {
      const query = '자유형';
      const mockTags = [
        { tagId: 1, tagName: '평영', usageCount: 8 },
        { tagId: 2, tagName: '배영', usageCount: 6 },
      ];

      MockCommunityRepository.getRelatedTags.mockResolvedValue(mockTags);

      const result = await service.getRelatedTags(query, 10);

      expect(repository.getRelatedTags).toHaveBeenCalledWith(query, 10);
      expect(result).toEqual(mockTags);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      const query = '자유';
      const mockSuggestions = [
        { suggestions: ['자유형', '자유형 배우기'], type: 'tag' as const },
        { suggestions: ['자유형 완벽 가이드'], type: 'title' as const },
      ];

      MockCommunityRepository.getSearchSuggestions.mockResolvedValue(
        mockSuggestions,
      );

      const result = await service.getSearchSuggestions(query, 5);

      expect(repository.getSearchSuggestions).toHaveBeenCalledWith(query, 5);
      expect(result).toEqual(mockSuggestions);
    });
  });

  describe('highlightSearchTerm', () => {
    it('should highlight search term in text', () => {
      const text = '자유형 배우기';
      const searchTerm = '자유형';

      const result = service.highlightSearchTerm(text, searchTerm);

      expect(result).toBe('<mark>자유형</mark> 배우기');
    });

    it('should handle case-insensitive highlighting', () => {
      const text = '자유형 배우기와 자유형 연습';
      const searchTerm = '자유형';

      const result = service.highlightSearchTerm(text, searchTerm);

      expect(result).toContain('<mark>');
    });

    it('should return original text when no search term', () => {
      const text = '자유형 배우기';
      const searchTerm = '';

      const result = service.highlightSearchTerm(text, searchTerm);

      expect(result).toBe(text);
    });
  });

  describe('applyHighlightingToCommunities', () => {
    it('should apply highlighting to communities', () => {
      const communities = [
        {
          communityId: 1,
          title: '자유형 배우기',
          content: '자유형 연습 방법',
          communityTags: [{ tag: { tagName: '자유형' } }],
        },
      ];
      const searchQuery = '자유형';

      const result = service.applyHighlightingToCommunities(
        communities,
        searchQuery,
      );

      expect(result[0].title).toContain('<mark>');
      expect(result[0].content).toContain('<mark>');
      expect(result[0].communityTags[0].tag.tagName).toContain('<mark>');
    });

    it('should return communities as-is when no search query', () => {
      const communities = [
        {
          communityId: 1,
          title: '자유형 배우기',
          content: '자유형 연습 방법',
        },
      ];
      const searchQuery = '';

      const result = service.applyHighlightingToCommunities(
        communities,
        searchQuery,
      );

      expect(result).toEqual(communities);
    });
  });
});
