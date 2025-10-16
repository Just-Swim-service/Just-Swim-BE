export interface SearchableEntity {
  id: number;
  title?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SearchParams {
  query?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'recent' | 'popular' | 'relevance';
  page?: number;
  limit?: number;
}

export interface SearchResult<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchQuery?: string;
  searchParams?: SearchParams;
}

export interface SearchSuggestion {
  suggestions: string[];
  type: 'title' | 'content' | 'tag';
}

export interface SearchableService<T = any> {
  search(
    query: string,
    page?: number,
    limit?: number,
    sortBy?: 'recent' | 'popular' | 'relevance',
  ): Promise<SearchResult<T>>;

  advancedSearch(
    searchParams: SearchParams,
    page?: number,
    limit?: number,
  ): Promise<SearchResult<T>>;

  getSearchSuggestions(
    query: string,
    limit?: number,
  ): Promise<SearchSuggestion[]>;

  getRelatedTags?(query: string, limit?: number): Promise<any[]>;
}
