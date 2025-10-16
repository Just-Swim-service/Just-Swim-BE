import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import {
  SearchableService,
  SearchResult,
  SearchSuggestion,
} from './interfaces/search.interface';

// Mock 검색 서비스
const mockSearchableService: SearchableService<any> = {
  search: jest.fn().mockResolvedValue({
    items: [{ id: 1, title: 'Test' }],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    searchQuery: 'test',
  }),
  advancedSearch: jest.fn().mockResolvedValue({
    items: [{ id: 1, title: 'Test' }],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  }),
  getSearchSuggestions: jest
    .fn()
    .mockResolvedValue([{ suggestions: ['test1', 'test2'], type: 'title' }]),
  getRelatedTags: jest
    .fn()
    .mockResolvedValue([{ tagId: 1, tagName: 'tag1', usageCount: 5 }]),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService],
    }).compile();

    service = module.get<SearchService>(SearchService);

    // 테스트용 검색 서비스 등록
    service.registerSearchableService('test-module', mockSearchableService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerSearchableService', () => {
    it('should register a searchable service', () => {
      const newMockService = { ...mockSearchableService };
      service.registerSearchableService('new-module', newMockService);

      expect(service.isModuleSearchable('new-module')).toBe(true);
    });

    it('should allow multiple modules to be registered', () => {
      service.registerSearchableService('module1', mockSearchableService);
      service.registerSearchableService('module2', mockSearchableService);

      expect(service.getAvailableModules()).toContain('module1');
      expect(service.getAvailableModules()).toContain('module2');
    });
  });

  describe('search', () => {
    it('should search in registered module', async () => {
      const result = await service.search(
        'test-module',
        'test query',
        1,
        10,
        'relevance',
      );

      expect(mockSearchableService.search).toHaveBeenCalledWith(
        'test query',
        1,
        10,
        'relevance',
      );
      expect(result.items).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('should throw error for unregistered module', async () => {
      await expect(
        service.search('unregistered-module', 'query', 1, 10, 'relevance'),
      ).rejects.toThrow(
        "Search service for module 'unregistered-module' not found",
      );
    });

    it('should use default parameters', async () => {
      await service.search('test-module', 'query');

      expect(mockSearchableService.search).toHaveBeenCalledWith(
        'query',
        1,
        10,
        'relevance',
      );
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search in registered module', async () => {
      const searchParams = {
        query: 'test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        sortBy: 'recent' as const,
      };

      const result = await service.advancedSearch(
        'test-module',
        searchParams,
        1,
        10,
      );

      expect(mockSearchableService.advancedSearch).toHaveBeenCalledWith(
        searchParams,
        1,
        10,
      );
      expect(result.items).toBeDefined();
    });

    it('should throw error for unregistered module', async () => {
      await expect(
        service.advancedSearch('unregistered-module', {}, 1, 10),
      ).rejects.toThrow(
        "Search service for module 'unregistered-module' not found",
      );
    });
  });

  describe('getSearchSuggestions', () => {
    it('should get search suggestions from registered module', async () => {
      const result = await service.getSearchSuggestions(
        'test-module',
        'test',
        5,
      );

      expect(mockSearchableService.getSearchSuggestions).toHaveBeenCalledWith(
        'test',
        5,
      );
      expect(result).toBeDefined();
      expect(result[0].type).toBe('title');
    });

    it('should throw error for unregistered module', async () => {
      await expect(
        service.getSearchSuggestions('unregistered-module', 'query', 5),
      ).rejects.toThrow(
        "Search service for module 'unregistered-module' not found",
      );
    });
  });

  describe('getRelatedTags', () => {
    it('should get related tags from registered module', async () => {
      const result = await service.getRelatedTags('test-module', 'test', 10);

      expect(mockSearchableService.getRelatedTags).toHaveBeenCalledWith(
        'test',
        10,
      );
      expect(result).toBeDefined();
      expect(result[0].tagName).toBe('tag1');
    });

    it('should throw error for unregistered module', async () => {
      await expect(
        service.getRelatedTags('unregistered-module', 'query', 10),
      ).rejects.toThrow(
        "Search service for module 'unregistered-module' not found",
      );
    });

    it('should throw error when module does not support related tags', async () => {
      const serviceWithoutTags: SearchableService<any> = {
        search: jest.fn(),
        advancedSearch: jest.fn(),
        getSearchSuggestions: jest.fn(),
      };

      service.registerSearchableService('no-tags-module', serviceWithoutTags);

      await expect(
        service.getRelatedTags('no-tags-module', 'query', 10),
      ).rejects.toThrow(
        "Related tags not supported for module 'no-tags-module'",
      );
    });
  });

  describe('getAvailableModules', () => {
    it('should return list of registered modules', () => {
      const modules = service.getAvailableModules();

      expect(modules).toContain('test-module');
      expect(Array.isArray(modules)).toBe(true);
    });

    it('should return empty array when no modules registered', () => {
      const newService = new SearchService();
      const modules = newService.getAvailableModules();

      expect(modules).toEqual([]);
    });
  });

  describe('isModuleSearchable', () => {
    it('should return true for registered module', () => {
      expect(service.isModuleSearchable('test-module')).toBe(true);
    });

    it('should return false for unregistered module', () => {
      expect(service.isModuleSearchable('unregistered-module')).toBe(false);
    });
  });
});
