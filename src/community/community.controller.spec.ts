import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  mockCommunity,
  mockCommunityComment,
  MockCommunityRepository,
} from 'src/common/mocks/mock-community.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { Reflector } from '@nestjs/core';
import { MyLogger } from 'src/common/logger/logger.service';
import { SecurityLoggerService } from 'src/common/security/security-logger.service';
import { ResponseService } from 'src/common/response/response.service';

describe('CommunityController', () => {
  let controller: CommunityController;
  let service: CommunityService;
  let responseService: ResponseService;

  const mockCommunityService = {
    createCommunity: jest.fn(),
    findAllCommunities: jest.fn(),
    findCommunityById: jest.fn(),
    updateCommunity: jest.fn(),
    deleteCommunity: jest.fn(),
    createComment: jest.fn(),
    getComments: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    toggleCommunityLike: jest.fn(),
    toggleCommentLike: jest.fn(),
    getCommunitiesByCategory: jest.fn(),
    getCommunitiesByTags: jest.fn(),
    getPopularTags: jest.fn(),
    searchTags: jest.fn(),
    getCategoryStats: jest.fn(),
    // 검색 관련 메서드
    searchCommunities: jest.fn(),
    advancedSearchCommunities: jest.fn(),
    getRelatedTags: jest.fn(),
    getSearchSuggestions: jest.fn(),
  };

  const mockResponseService = {
    success: jest.fn(),
    error: jest.fn(),
    unauthorized: jest.fn(),
    notFound: jest.fn(),
    conflict: jest.fn(),
    forbidden: jest.fn(),
    internalServerError: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService,
        },
        {
          provide: ResponseService,
          useValue: mockResponseService,
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserByPk: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: MyLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
        {
          provide: SecurityLoggerService,
          useValue: {
            logSecurityEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    service = module.get<CommunityService>(CommunityService);
    responseService = module.get<ResponseService>(ResponseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCommunity', () => {
    it('should create a community post', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const createCommunityDto: CreateCommunityDto = {
        title: 'Test Post',
        content: 'Test content',
        workoutData: { workoutTime: '30분' },
      };

      mockCommunityService.createCommunity.mockResolvedValue(mockCommunity);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.createCommunity(createCommunityDto, res);

      expect(service.createCommunity).toHaveBeenCalledWith(
        1,
        createCommunityDto,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글이 성공적으로 작성되었습니다.',
        mockCommunity,
      );
    });
  });

  describe('findAllCommunities', () => {
    it('should return paginated communities', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = {
        communities: [mockCommunity],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockCommunityService.findAllCommunities.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.findAllCommunities(res, '1', '10');

      expect(service.findAllCommunities).toHaveBeenCalledWith(1, 10);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글 목록을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should filter by category', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = {
        communities: [mockCommunity],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockCommunityService.getCommunitiesByCategory.mockResolvedValue(
        expectedResult,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.findAllCommunities(res, '1', '10', '운동기록');

      expect(service.getCommunitiesByCategory).toHaveBeenCalledWith(
        '운동기록',
        1,
        10,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글 목록을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should filter by tags', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = {
        communities: [mockCommunity],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockCommunityService.getCommunitiesByTags.mockResolvedValue(
        expectedResult,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.findAllCommunities(
        res,
        '1',
        '10',
        undefined,
        '자유형,평영',
      );

      expect(service.getCommunitiesByTags).toHaveBeenCalledWith(
        ['자유형', '평영'],
        1,
        10,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글 목록을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should use default pagination values', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = {
        communities: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockCommunityService.findAllCommunities.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.findAllCommunities(res, undefined, undefined);

      expect(service.findAllCommunities).toHaveBeenCalledWith(1, 10);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글 목록을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });
  });

  describe('findCommunityById', () => {
    it('should return community with user info', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const communityId = '1';
      const expectedResult = {
        ...mockCommunity,
        isLiked: true,
        comments: [mockCommunityComment],
      };

      mockCommunityService.findCommunityById.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.findCommunityById(communityId, res);

      expect(service.findCommunityById).toHaveBeenCalledWith(1, 1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글 상세 정보를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should return community without user info when not logged in', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: undefined },
      } as any;
      const communityId = '1';
      const expectedResult = {
        ...mockCommunity,
        isLiked: false,
        comments: [],
      };

      mockCommunityService.findCommunityById.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.findCommunityById(communityId, res);

      expect(service.findCommunityById).toHaveBeenCalledWith(1, undefined);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글 상세 정보를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });
  });

  describe('updateCommunity', () => {
    it('should update community', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const communityId = '1';
      const updateCommunityDto: UpdateCommunityDto = {
        title: 'Updated Title',
      };

      const expectedResult = {
        ...mockCommunity,
        title: 'Updated Title',
      };

      mockCommunityService.updateCommunity.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.updateCommunity(communityId, updateCommunityDto, res);

      expect(service.updateCommunity).toHaveBeenCalledWith(
        1,
        1,
        updateCommunityDto,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글이 성공적으로 수정되었습니다.',
        expectedResult,
      );
    });
  });

  describe('deleteCommunity', () => {
    it('should delete community', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const communityId = '1';

      const expectedResult = { message: '게시글이 삭제되었습니다.' };

      mockCommunityService.deleteCommunity.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.deleteCommunity(communityId, res);

      expect(service.deleteCommunity).toHaveBeenCalledWith(1, 1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '게시글이 성공적으로 삭제되었습니다.',
        expectedResult,
      );
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const communityId = '1';
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };

      mockCommunityService.createComment.mockResolvedValue(
        mockCommunityComment,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.createComment(communityId, createCommentDto, res);

      expect(service.createComment).toHaveBeenCalledWith(
        1,
        1,
        createCommentDto,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '댓글이 성공적으로 작성되었습니다.',
        mockCommunityComment,
      );
    });

    it('should create a reply comment', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const communityId = '1';
      const createCommentDto: CreateCommentDto = {
        content: 'Test reply',
        parentCommentId: 1,
      };

      mockCommunityService.createComment.mockResolvedValue(
        mockCommunityComment,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.createComment(communityId, createCommentDto, res);

      expect(service.createComment).toHaveBeenCalledWith(
        1,
        1,
        createCommentDto,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '댓글이 성공적으로 작성되었습니다.',
        mockCommunityComment,
      );
    });
  });

  describe('getComments', () => {
    it('should return comments for community', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const communityId = '1';
      const expectedResult = [mockCommunityComment];

      mockCommunityService.getComments.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getComments(communityId, res);

      expect(service.getComments).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '댓글 목록을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });
  });

  describe('updateComment', () => {
    it('should update comment', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const commentId = '1';
      const content = 'Updated comment';

      const expectedResult = {
        ...mockCommunityComment,
        content: 'Updated comment',
      };

      mockCommunityService.updateComment.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.updateComment(commentId, content, res);

      expect(service.updateComment).toHaveBeenCalledWith(1, 1, content);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '댓글이 성공적으로 수정되었습니다.',
        expectedResult,
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete comment', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const commentId = '1';

      const expectedResult = { message: '댓글이 삭제되었습니다.' };

      mockCommunityService.deleteComment.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.deleteComment(commentId, res);

      expect(service.deleteComment).toHaveBeenCalledWith(1, 1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '댓글이 성공적으로 삭제되었습니다.',
        expectedResult,
      );
    });
  });

  describe('toggleCommunityLike', () => {
    it('should toggle community like', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const communityId = '1';

      const expectedResult = { isLiked: true };

      mockCommunityService.toggleCommunityLike.mockResolvedValue(
        expectedResult,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.toggleCommunityLike(communityId, res);

      expect(service.toggleCommunityLike).toHaveBeenCalledWith(1, 1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '좋아요 상태가 성공적으로 변경되었습니다.',
        expectedResult,
      );
    });
  });

  describe('toggleCommentLike', () => {
    it('should toggle comment like', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { user: { userId: 1 } },
      } as any;
      const commentId = '1';

      const expectedResult = { isLiked: true };

      mockCommunityService.toggleCommentLike.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.toggleCommentLike(commentId, res);

      expect(service.toggleCommentLike).toHaveBeenCalledWith(1, 1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '좋아요 상태가 성공적으로 변경되었습니다.',
        expectedResult,
      );
    });
  });

  // 태그 및 카테고리 관련 테스트
  describe('getPopularTags', () => {
    it('should return popular tags', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = [
        { tagId: 1, tagName: '자유형', usageCount: 10 },
        { tagId: 2, tagName: '평영', usageCount: 8 },
      ];

      mockCommunityService.getPopularTags.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getPopularTags('20', res);

      expect(service.getPopularTags).toHaveBeenCalledWith(20);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '인기 태그 목록을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });
  });

  describe('searchTags', () => {
    it('should search tags by query', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = [{ tagId: 1, tagName: '자유형', usageCount: 10 }];

      mockCommunityService.searchTags.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.searchTags('자유', '10', res);

      expect(service.searchTags).toHaveBeenCalledWith('자유', 10);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '태그 검색 결과를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });
  });

  describe('getCategoryStats', () => {
    it('should return category statistics', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = [
        { category: '운동기록', count: 10 },
        { category: '질문', count: 5 },
      ];

      mockCommunityService.getCategoryStats.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getCategoryStats(res);

      expect(service.getCategoryStats).toHaveBeenCalled();
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '카테고리 통계를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });
  });

  // 검색 관련 테스트
  describe('searchCommunities', () => {
    it('should search communities', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const query = '자유형';
      const expectedResult = {
        communities: [mockCommunity],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        searchQuery: query,
        sortBy: 'relevance',
      };

      mockCommunityService.searchCommunities.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.searchCommunities(query, '1', '10', 'relevance', res);

      expect(service.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'relevance',
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '검색 결과를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should search communities with different sort options', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockCommunityService.searchCommunities.mockResolvedValue({
        communities: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      mockResponseService.success.mockReturnValue(undefined);

      // 최신순
      await controller.searchCommunities('query', '1', '10', 'recent', res);
      expect(service.searchCommunities).toHaveBeenCalledWith(
        'query',
        1,
        10,
        'recent',
      );

      // 인기순
      await controller.searchCommunities('query', '1', '10', 'popular', res);
      expect(service.searchCommunities).toHaveBeenCalledWith(
        'query',
        1,
        10,
        'popular',
      );
    });
  });

  describe('advancedSearchCommunities', () => {
    it('should perform advanced search with all filters', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const expectedResult = {
        communities: [mockCommunity],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCommunityService.advancedSearchCommunities.mockResolvedValue(
        expectedResult,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.advancedSearchCommunities(
        res,
        '자유형',
        '수영팁',
        '자유형,초보',
        '2024-01-01',
        '2024-12-31',
        '5',
        '3',
        'likes',
        '1',
        '10',
      );

      expect(service.advancedSearchCommunities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '자유형',
          category: '수영팁',
          tags: ['자유형', '초보'],
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          minLikes: 5,
          minComments: 3,
          sortBy: 'likes',
        }),
        1,
        10,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '고급 검색 결과를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should handle search with minimal parameters', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockCommunityService.advancedSearchCommunities.mockResolvedValue({
        communities: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      mockResponseService.success.mockReturnValue(undefined);

      await controller.advancedSearchCommunities(
        res,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'relevance',
        '1',
        '10',
      );

      expect(service.advancedSearchCommunities).toHaveBeenCalled();
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const query = '자유';
      const expectedResult = [
        { suggestions: ['자유형', '자유형 배우기'], type: 'tag' },
        { suggestions: ['자유형 완벽 가이드'], type: 'title' },
      ];

      mockCommunityService.getSearchSuggestions.mockResolvedValue(
        expectedResult,
      );
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getSearchSuggestions(query, '5', res);

      expect(service.getSearchSuggestions).toHaveBeenCalledWith(query, 5);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '검색어 자동완성 제안을 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should use default limit', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockCommunityService.getSearchSuggestions.mockResolvedValue([]);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getSearchSuggestions('query', undefined, res);

      expect(service.getSearchSuggestions).toHaveBeenCalledWith('query', 5);
    });
  });

  describe('getRelatedTags', () => {
    it('should return related tags', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const query = '자유형';
      const expectedResult = [
        { tagId: 1, tagName: '평영', usageCount: 8 },
        { tagId: 2, tagName: '배영', usageCount: 6 },
      ];

      mockCommunityService.getRelatedTags.mockResolvedValue(expectedResult);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getRelatedTags(query, '10', res);

      expect(service.getRelatedTags).toHaveBeenCalledWith(query, 10);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '관련 태그를 성공적으로 조회했습니다.',
        expectedResult,
      );
    });

    it('should use default limit', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockCommunityService.getRelatedTags.mockResolvedValue([]);
      mockResponseService.success.mockReturnValue(undefined);

      await controller.getRelatedTags('query', undefined, res);

      expect(service.getRelatedTags).toHaveBeenCalledWith('query', 10);
    });
  });
});
