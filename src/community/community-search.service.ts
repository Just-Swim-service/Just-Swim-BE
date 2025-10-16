import { Injectable } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { Community } from './entity/community.entity';
import { CategoryType } from './enum/category-type.enum';
import {
  SearchableService,
  SearchParams,
  SearchResult,
  SearchSuggestion,
  SearchableEntity,
} from '../common/search/interfaces/search.interface';

// Community를 SearchableEntity에 맞게 확장
interface SearchableCommunity extends SearchableEntity {
  communityId: number;
  title: string;
  content: string;
  category: CategoryType;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  user: any;
  communityTags?: any[];
  communityCreatedAt: Date;
  communityUpdatedAt: Date;
  communityDeletedAt?: Date;
}

@Injectable()
export class CommunitySearchService
  implements SearchableService<SearchableCommunity>
{
  constructor(private readonly communityRepository: CommunityRepository) {}

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
  ): Promise<SearchResult<SearchableCommunity>> {
    const { communities, total } =
      await this.communityRepository.searchCommunities(
        query,
        page,
        limit,
        sortBy,
      );

    // 검색 결과에 하이라이팅 적용
    const highlightedCommunities = this.applyHighlightingToCommunities(
      communities,
      query,
    );

    return {
      items: highlightedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchQuery: query,
      searchParams: { query, sortBy },
    };
  }

  async advancedSearch(
    searchParams: SearchParams,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResult<SearchableCommunity>> {
    const { query, startDate, endDate, sortBy = 'relevance' } = searchParams;

    // 커뮤니티 특화 파라미터로 변환
    const communitySearchParams = {
      query,
      startDate,
      endDate,
      sortBy,
    };

    const { communities, total } =
      await this.communityRepository.advancedSearchCommunities(
        communitySearchParams,
        page,
        limit,
      );

    // 검색어가 있으면 하이라이팅 적용
    const highlightedCommunities = query
      ? this.applyHighlightingToCommunities(communities, query)
      : communities;

    return {
      items: highlightedCommunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchParams,
    };
  }

  async getSearchSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<SearchSuggestion[]> {
    return await this.communityRepository.getSearchSuggestions(query, limit);
  }

  async getRelatedTags(query: string, limit: number = 10): Promise<any[]> {
    return await this.communityRepository.getRelatedTags(query, limit);
  }

  // 검색 결과 하이라이팅을 위한 유틸리티 메서드
  private highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // 검색 결과에 하이라이팅 적용
  private applyHighlightingToCommunities(
    communities: any[],
    searchQuery: string,
  ) {
    if (!searchQuery) return communities;

    return communities.map((community) => ({
      ...community,
      title: this.highlightSearchTerm(community.title, searchQuery),
      content: this.highlightSearchTerm(community.content, searchQuery),
      // 태그에도 하이라이팅 적용
      communityTags: community.communityTags?.map((ct: any) => ({
        ...ct,
        tag: {
          ...ct.tag,
          tagName: this.highlightSearchTerm(ct.tag.tagName, searchQuery),
        },
      })),
    }));
  }
}
