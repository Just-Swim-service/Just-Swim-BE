import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ResponseService } from '../response/response.service';
import { Response } from 'express';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;
  let responseService: ResponseService;

  const mockSearchService = {
    search: jest.fn(),
    advancedSearch: jest.fn(),
    getSearchSuggestions: jest.fn(),
    getRelatedTags: jest.fn(),
    getAvailableModules: jest.fn(),
    isModuleSearchable: jest.fn(),
  };

  const mockResponseService = {
    success: jest.fn((res, message, data) => ({ message, data })),
    error: jest.fn(),
  };

  const mockResponse = {
    locals: { user: { userId: 1 } },
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: ResponseService,
          useValue: mockResponseService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
    responseService = module.get<ResponseService>(ResponseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAvailableModules', () => {
    it('should return list of available search modules', async () => {
      const mockModules = ['community', 'lecture', 'feedback'];
      mockSearchService.getAvailableModules.mockReturnValue(mockModules);

      await controller.getAvailableModules(mockResponse);

      expect(searchService.getAvailableModules).toHaveBeenCalled();
      expect(responseService.success).toHaveBeenCalledWith(
        mockResponse,
        '검색 가능한 모듈 목록을 성공적으로 조회했습니다.',
        { modules: mockModules },
      );
    });
  });

  describe('searchModule', () => {
    it('should search in specified module', async () => {
      const module = 'community';
      const query = '자유형';
      const mockResult = {
        items: [{ id: 1, title: '자유형 가이드' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockSearchService.isModuleSearchable.mockReturnValue(true);
      mockSearchService.search.mockResolvedValue(mockResult);

      await controller.searchModule(
        module,
        query,
        '1',
        '10',
        'relevance',
        mockResponse,
      );

      expect(searchService.isModuleSearchable).toHaveBeenCalledWith(module);
      expect(searchService.search).toHaveBeenCalledWith(
        module,
        query,
        1,
        10,
        'relevance',
      );
      expect(responseService.success).toHaveBeenCalledWith(
        mockResponse,
        '검색 결과를 성공적으로 조회했습니다.',
        mockResult,
      );
    });

    it('should throw BadRequestException for non-searchable module', async () => {
      mockSearchService.isModuleSearchable.mockReturnValue(false);

      await expect(
        controller.searchModule(
          'invalid-module',
          'query',
          '1',
          '10',
          'relevance',
          mockResponse,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use default pagination values', async () => {
      mockSearchService.isModuleSearchable.mockReturnValue(true);
      mockSearchService.search.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await controller.searchModule(
        'community',
        'query',
        undefined,
        undefined,
        'relevance',
        mockResponse,
      );

      expect(searchService.search).toHaveBeenCalledWith(
        'community',
        'query',
        1,
        10,
        'relevance',
      );
    });
  });

  describe('advancedSearchModule', () => {
    it('should perform advanced search', async () => {
      const module = 'community';
      const mockResult = {
        items: [{ id: 1, title: '테스트' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockSearchService.isModuleSearchable.mockReturnValue(true);
      mockSearchService.advancedSearch.mockResolvedValue(mockResult);

      await controller.advancedSearchModule(
        module,
        mockResponse,
        '자유형',
        '2024-01-01',
        '2024-12-31',
        'recent',
        '1',
        '10',
      );

      expect(searchService.isModuleSearchable).toHaveBeenCalledWith(module);
      expect(searchService.advancedSearch).toHaveBeenCalledWith(
        module,
        expect.objectContaining({
          query: '자유형',
          sortBy: 'recent',
        }),
        1,
        10,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        mockResponse,
        '고급 검색 결과를 성공적으로 조회했습니다.',
        mockResult,
      );
    });

    it('should handle search without query', async () => {
      mockSearchService.isModuleSearchable.mockReturnValue(true);
      mockSearchService.advancedSearch.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await controller.advancedSearchModule(
        'community',
        mockResponse,
        undefined,
        undefined,
        undefined,
        'relevance',
        '1',
        '10',
      );

      expect(searchService.advancedSearch).toHaveBeenCalledWith(
        'community',
        expect.objectContaining({
          query: undefined,
          startDate: undefined,
          endDate: undefined,
          sortBy: 'relevance',
        }),
        1,
        10,
      );
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      const module = 'community';
      const query = '자유';
      const mockSuggestions = [
        { suggestions: ['자유형', '자유형 배우기'], type: 'tag' as const },
      ];

      mockSearchService.isModuleSearchable.mockReturnValue(true);
      mockSearchService.getSearchSuggestions.mockResolvedValue(mockSuggestions);

      await controller.getSearchSuggestions(module, query, '5', mockResponse);

      expect(searchService.isModuleSearchable).toHaveBeenCalledWith(module);
      expect(searchService.getSearchSuggestions).toHaveBeenCalledWith(
        module,
        query,
        5,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        mockResponse,
        '검색어 자동완성을 성공적으로 조회했습니다.',
        mockSuggestions,
      );
    });

    it('should throw error for non-searchable module', async () => {
      mockSearchService.isModuleSearchable.mockReturnValue(false);

      await expect(
        controller.getSearchSuggestions(
          'invalid-module',
          'query',
          '5',
          mockResponse,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRelatedTags', () => {
    it('should return related tags', async () => {
      const module = 'community';
      const query = '자유형';
      const mockTags = [
        { tagId: 1, tagName: '평영', usageCount: 8 },
        { tagId: 2, tagName: '배영', usageCount: 6 },
      ];

      mockSearchService.isModuleSearchable.mockReturnValue(true);
      mockSearchService.getRelatedTags.mockResolvedValue(mockTags);

      await controller.getRelatedTags(module, query, '10', mockResponse);

      expect(searchService.isModuleSearchable).toHaveBeenCalledWith(module);
      expect(searchService.getRelatedTags).toHaveBeenCalledWith(
        module,
        query,
        10,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        mockResponse,
        '관련 태그를 성공적으로 조회했습니다.',
        mockTags,
      );
    });

    it('should throw error for non-searchable module', async () => {
      mockSearchService.isModuleSearchable.mockReturnValue(false);

      await expect(
        controller.getRelatedTags(
          'invalid-module',
          'query',
          '10',
          mockResponse,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
