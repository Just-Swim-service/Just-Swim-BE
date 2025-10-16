import { Injectable } from '@nestjs/common';
import {
  SearchableService,
  SearchParams,
  SearchResult,
  SearchSuggestion,
} from './interfaces/search.interface';

@Injectable()
export class SearchService {
  private searchableServices: Map<string, SearchableService<any>> = new Map();

  /**
   * 검색 가능한 서비스를 등록합니다.
   * @param moduleName 모듈 이름 (예: 'community', 'lecture', 'feedback')
   * @param service 검색 가능한 서비스 인스턴스
   */
  registerSearchableService(
    moduleName: string,
    service: SearchableService<any>,
  ): void {
    this.searchableServices.set(moduleName, service);
  }

  /**
   * 특정 모듈에서 검색을 수행합니다.
   * @param moduleName 모듈 이름
   * @param query 검색어
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @param sortBy 정렬 기준
   */
  async search<T = any>(
    moduleName: string,
    query: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
  ): Promise<SearchResult<T>> {
    const service = this.searchableServices.get(moduleName);
    if (!service) {
      throw new Error(`Search service for module '${moduleName}' not found`);
    }

    return service.search(query, page, limit, sortBy) as Promise<
      SearchResult<T>
    >;
  }

  /**
   * 특정 모듈에서 고급 검색을 수행합니다.
   * @param moduleName 모듈 이름
   * @param searchParams 검색 파라미터
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   */
  async advancedSearch<T = any>(
    moduleName: string,
    searchParams: SearchParams,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResult<T>> {
    const service = this.searchableServices.get(moduleName);
    if (!service) {
      throw new Error(`Search service for module '${moduleName}' not found`);
    }

    return service.advancedSearch(searchParams, page, limit) as Promise<
      SearchResult<T>
    >;
  }

  /**
   * 특정 모듈에서 검색어 자동완성을 가져옵니다.
   * @param moduleName 모듈 이름
   * @param query 검색어
   * @param limit 제안 개수
   */
  async getSearchSuggestions(
    moduleName: string,
    query: string,
    limit: number = 5,
  ): Promise<SearchSuggestion[]> {
    const service = this.searchableServices.get(moduleName);
    if (!service) {
      throw new Error(`Search service for module '${moduleName}' not found`);
    }

    return service.getSearchSuggestions(query, limit);
  }

  /**
   * 특정 모듈에서 관련 태그를 가져옵니다.
   * @param moduleName 모듈 이름
   * @param query 검색어
   * @param limit 태그 개수
   */
  async getRelatedTags(
    moduleName: string,
    query: string,
    limit: number = 10,
  ): Promise<any[]> {
    const service = this.searchableServices.get(moduleName);
    if (!service) {
      throw new Error(`Search service for module '${moduleName}' not found`);
    }

    if (!service.getRelatedTags) {
      throw new Error(`Related tags not supported for module '${moduleName}'`);
    }

    return service.getRelatedTags(query, limit);
  }

  /**
   * 등록된 모든 검색 가능한 모듈 목록을 반환합니다.
   */
  getAvailableModules(): string[] {
    return Array.from(this.searchableServices.keys());
  }

  /**
   * 특정 모듈이 검색 가능한지 확인합니다.
   * @param moduleName 모듈 이름
   */
  isModuleSearchable(moduleName: string): boolean {
    return this.searchableServices.has(moduleName);
  }
}
