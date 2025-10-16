import {
  Controller,
  Get,
  Query,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SearchService } from './search.service';
import { ResponseService } from '../response/response.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('modules')
  @ApiOperation({ summary: '검색 가능한 모듈 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '검색 가능한 모듈 목록을 성공적으로 조회했습니다.',
  })
  async getAvailableModules(@Res() res: Response) {
    const modules = this.searchService.getAvailableModules();
    return this.responseService.success(
      res,
      '검색 가능한 모듈 목록을 성공적으로 조회했습니다.',
      { modules },
    );
  }

  @Get(':module/search')
  @ApiOperation({ summary: '특정 모듈에서 통합 검색' })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
  })
  @ApiParam({
    name: 'module',
    description: '검색할 모듈 이름',
    example: 'community',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색어',
    example: '자유형',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '정렬 기준',
    enum: ['recent', 'popular', 'relevance'],
    example: 'relevance',
  })
  async searchModule(
    @Param('module') module: string,
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
    @Res() res: Response,
  ) {
    if (!this.searchService.isModuleSearchable(module)) {
      throw new BadRequestException(`Module '${module}' is not searchable`);
    }

    const result = await this.searchService.search(
      module,
      query,
      parseInt(page),
      parseInt(limit),
      sortBy,
    );

    return this.responseService.success(
      res,
      '검색 결과를 성공적으로 조회했습니다.',
      result,
    );
  }

  @Get(':module/search/advanced')
  @ApiOperation({ summary: '특정 모듈에서 고급 검색' })
  @ApiResponse({
    status: 200,
    description: '고급 검색 결과를 성공적으로 조회했습니다.',
  })
  @ApiParam({
    name: 'module',
    description: '검색할 모듈 이름',
    example: 'community',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: '검색어',
    example: '자유형',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '시작 날짜 (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '종료 날짜 (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '정렬 기준',
    enum: ['recent', 'popular', 'relevance'],
    example: 'relevance',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: 10,
  })
  async advancedSearchModule(
    @Param('module') module: string,
    @Res() res: Response,
    @Query('q') query?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy: 'recent' | 'popular' | 'relevance' = 'relevance',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (!this.searchService.isModuleSearchable(module)) {
      throw new BadRequestException(`Module '${module}' is not searchable`);
    }

    const searchParams = {
      query,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      sortBy,
    };

    const result = await this.searchService.advancedSearch(
      module,
      searchParams,
      parseInt(page),
      parseInt(limit),
    );

    return this.responseService.success(
      res,
      '고급 검색 결과를 성공적으로 조회했습니다.',
      result,
    );
  }

  @Get(':module/search/suggestions')
  @ApiOperation({ summary: '특정 모듈에서 검색어 자동완성' })
  @ApiResponse({
    status: 200,
    description: '검색어 자동완성을 성공적으로 조회했습니다.',
  })
  @ApiParam({
    name: 'module',
    description: '검색할 모듈 이름',
    example: 'community',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색어 (최소 2글자)',
    example: '자유',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '제안 개수',
    example: 5,
  })
  async getSearchSuggestions(
    @Param('module') module: string,
    @Query('q') query: string,
    @Query('limit') limit: string = '5',
    @Res() res: Response,
  ) {
    if (!this.searchService.isModuleSearchable(module)) {
      throw new BadRequestException(`Module '${module}' is not searchable`);
    }

    const result = await this.searchService.getSearchSuggestions(
      module,
      query,
      parseInt(limit),
    );

    return this.responseService.success(
      res,
      '검색어 자동완성을 성공적으로 조회했습니다.',
      result,
    );
  }

  @Get(':module/search/related-tags')
  @ApiOperation({ summary: '특정 모듈에서 관련 태그 추천' })
  @ApiResponse({
    status: 200,
    description: '관련 태그를 성공적으로 조회했습니다.',
  })
  @ApiParam({
    name: 'module',
    description: '검색할 모듈 이름',
    example: 'community',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색어',
    example: '자유형',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '추천 태그 개수',
    example: 10,
  })
  async getRelatedTags(
    @Param('module') module: string,
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
    @Res() res: Response,
  ) {
    if (!this.searchService.isModuleSearchable(module)) {
      throw new BadRequestException(`Module '${module}' is not searchable`);
    }

    const result = await this.searchService.getRelatedTags(
      module,
      query,
      parseInt(limit),
    );

    return this.responseService.success(
      res,
      '관련 태그를 성공적으로 조회했습니다.',
      result,
    );
  }
}
