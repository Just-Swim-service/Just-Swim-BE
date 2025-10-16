import { Test, TestingModule } from '@nestjs/testing';
import { CommunitySearchService } from './community-search.service';
import { CommunityRepository } from './community.repository';
import {
  mockCommunity,
  MockCommunityRepository,
} from 'src/common/mocks/mock-community.repository';

describe('CommunitySearchService', () => {
  let service: CommunitySearchService;
  let repository: CommunityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitySearchService,
        {
          provide: CommunityRepository,
          useValue: MockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CommunitySearchService>(CommunitySearchService);
    repository = module.get<CommunityRepository>(CommunityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search communities and return SearchResult format', async () => {
      const query = '자유형';
      const mockSearchResult = {
        communities: [
          {
            ...mockCommunity,
            title: '자유형 배우기',
            content: '자유형 연습 방법',
            communityTags: [{ tag: { tagName: '자유형' } }],
          },
        ],
        total: 1,
      };

      MockCommunityRepository.searchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.search(query, 1, 10, 'relevance');

      expect(repository.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'relevance',
      );
      expect(result.items).toBeDefined();
      expect(result.items[0].title).toContain('<mark>');
      expect(result.pagination.total).toBe(1);
      expect(result.searchQuery).toBe(query);
      expect(result.searchParams).toEqual({ query, sortBy: 'relevance' });
    });

    it('should apply highlighting to search results', async () => {
      const query = '수영';
      const mockSearchResult = {
        communities: [
          {
            ...mockCommunity,
            title: '수영 완벽 가이드',
            content: '수영 배우는 방법',
            communityTags: [{ tag: { tagName: '수영' } }],
          },
        ],
        total: 1,
      };

      MockCommunityRepository.searchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.search(query, 1, 10, 'relevance');

      expect(result.items[0].title).toContain('<mark>수영</mark>');
      expect(result.items[0].content).toContain('<mark>수영</mark>');
      expect(result.items[0].communityTags[0].tag.tagName).toContain(
        '<mark>수영</mark>',
      );
    });

    it('should support different sort options', async () => {
      const query = '테스트';
      const mockSearchResult = {
        communities: [mockCommunity],
        total: 1,
      };

      MockCommunityRepository.searchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      // 최신순
      await service.search(query, 1, 10, 'recent');
      expect(repository.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'recent',
      );

      // 인기순
      await service.search(query, 1, 10, 'popular');
      expect(repository.searchCommunities).toHaveBeenCalledWith(
        query,
        1,
        10,
        'popular',
      );
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with filters', async () => {
      const searchParams = {
        query: '자유형',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        sortBy: 'recent' as const,
      };

      const mockSearchResult = {
        communities: [
          {
            ...mockCommunity,
            title: '자유형 가이드',
            content: '자유형 내용',
          },
        ],
        total: 1,
      };

      MockCommunityRepository.advancedSearchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.advancedSearch(searchParams, 1, 10);

      expect(repository.advancedSearchCommunities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '자유형',
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          sortBy: 'recent',
        }),
        1,
        10,
      );
      expect(result.items).toBeDefined();
      expect(result.items[0].title).toContain('<mark>');
      expect(result.pagination.total).toBe(1);
    });

    it('should not apply highlighting when no query provided', async () => {
      const searchParams = {
        startDate: new Date('2024-01-01'),
        sortBy: 'recent' as const,
      };

      const mockSearchResult = {
        communities: [
          {
            ...mockCommunity,
            title: '일반 제목',
          },
        ],
        total: 1,
      };

      MockCommunityRepository.advancedSearchCommunities.mockResolvedValue(
        mockSearchResult,
      );

      const result = await service.advancedSearch(searchParams, 1, 10);

      expect(result.items[0].title).toBe('일반 제목');
      expect(result.items[0].title).not.toContain('<mark>');
    });
  });

  describe('getSearchSuggestions', () => {
    it('should get search suggestions', async () => {
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
      expect(result).toHaveLength(2);
    });
  });

  describe('getRelatedTags', () => {
    it('should get related tags', async () => {
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
});
