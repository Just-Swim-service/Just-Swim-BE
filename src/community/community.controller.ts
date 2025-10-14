import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiResponse({
    status: 201,
    description: '게시글이 성공적으로 작성되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const result = await this.communityService.createCommunity(
      userId,
      createCommunityDto,
    );
    return this.responseService.success(
      res,
      '게시글이 성공적으로 작성되었습니다.',
      result,
    );
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회 (카테고리/태그 필터링 가능)' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록을 성공적으로 조회했습니다.',
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
    name: 'category',
    required: false,
    description: '카테고리 필터 (질문, 운동기록, 수영팁, 후기, 수영일상)',
    enum: ['질문', '운동기록', '수영팁', '후기', '수영일상'],
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: '태그 필터 (쉼표로 구분, 예: 자유형,평영)',
    example: '자유형,평영',
  })
  async findAllCommunities(
    @Res() res: Response,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    let result: any;

    // 카테고리 필터링
    if (category) {
      result = await this.communityService.getCommunitiesByCategory(
        category,
        parseInt(page),
        parseInt(limit),
      );
    }
    // 태그 필터링
    else if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      result = await this.communityService.getCommunitiesByTags(
        tagArray,
        parseInt(page),
        parseInt(limit),
      );
    }
    // 전체 조회
    else {
      result = await this.communityService.findAllCommunities(
        parseInt(page),
        parseInt(limit),
      );
    }

    return this.responseService.success(
      res,
      '게시글 목록을 성공적으로 조회했습니다.',
      result,
    );
  }

  // 태그 및 카테고리 관련 엔드포인트 (동적 라우트보다 먼저 배치)
  @Get('tags/popular')
  @ApiOperation({ summary: '인기 태그 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '인기 태그 목록을 성공적으로 조회했습니다.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '조회할 태그 개수',
    example: 20,
  })
  async getPopularTags(
    @Query('limit') limit: string = '20',
    @Res() res: Response,
  ) {
    const result = await this.communityService.getPopularTags(parseInt(limit));
    return this.responseService.success(
      res,
      '인기 태그 목록을 성공적으로 조회했습니다.',
      result,
    );
  }

  @Get('tags/search')
  @ApiOperation({ summary: '태그 자동완성 검색' })
  @ApiResponse({
    status: 200,
    description: '태그 검색 결과를 성공적으로 조회했습니다.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색할 태그 키워드',
    example: '자유',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '검색 결과 개수',
    example: 10,
  })
  async searchTags(
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
    @Res() res: Response,
  ) {
    const result = await this.communityService.searchTags(
      query,
      parseInt(limit),
    );
    return this.responseService.success(
      res,
      '태그 검색 결과를 성공적으로 조회했습니다.',
      result,
    );
  }

  @Get('categories/stats')
  @ApiOperation({ summary: '카테고리별 게시글 수 통계' })
  @ApiResponse({
    status: 200,
    description: '카테고리 통계를 성공적으로 조회했습니다.',
  })
  async getCategoryStats(@Res() res: Response) {
    const result = await this.communityService.getCategoryStats();
    return this.responseService.success(
      res,
      '카테고리 통계를 성공적으로 조회했습니다.',
      result,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 정보를 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async findCommunityById(@Param('id') id: string, @Res() res: Response) {
    const userId = res.locals.user?.userId;
    const result = await this.communityService.findCommunityById(
      parseInt(id),
      userId,
    );
    return this.responseService.success(
      res,
      '게시글 상세 정보를 성공적으로 조회했습니다.',
      result,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({
    status: 200,
    description: '게시글이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async updateCommunity(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const result = await this.communityService.updateCommunity(
      parseInt(id),
      userId,
      updateCommunityDto,
    );
    return this.responseService.success(
      res,
      '게시글이 성공적으로 수정되었습니다.',
      result,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({
    status: 200,
    description: '게시글이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async deleteCommunity(@Param('id') id: string, @Res() res: Response) {
    const { userId } = res.locals.user;
    const result = await this.communityService.deleteCommunity(
      parseInt(id),
      userId,
    );
    return this.responseService.success(
      res,
      '게시글이 성공적으로 삭제되었습니다.',
      result,
    );
  }

  // 댓글 관련 엔드포인트
  @Post(':id/comments')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({
    status: 201,
    description: '댓글이 성공적으로 작성되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const result = await this.communityService.createComment(
      parseInt(id),
      userId,
      createCommentDto,
    );
    return this.responseService.success(
      res,
      '댓글이 성공적으로 작성되었습니다.',
      result,
    );
  }

  @Get(':id/comments')
  @ApiOperation({ summary: '댓글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '댓글 목록을 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async getComments(@Param('id') id: string, @Res() res: Response) {
    const result = await this.communityService.getComments(parseInt(id));
    return this.responseService.success(
      res,
      '댓글 목록을 성공적으로 조회했습니다.',
      result,
    );
  }

  @Patch('comments/:commentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({
    status: 200,
    description: '댓글이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다.' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body('content') content: string,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const result = await this.communityService.updateComment(
      parseInt(commentId),
      userId,
      content,
    );
    return this.responseService.success(
      res,
      '댓글이 성공적으로 수정되었습니다.',
      result,
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({
    status: 200,
    description: '댓글이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다.' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const result = await this.communityService.deleteComment(
      parseInt(commentId),
      userId,
    );
    return this.responseService.success(
      res,
      '댓글이 성공적으로 삭제되었습니다.',
      result,
    );
  }

  // 좋아요 관련 엔드포인트
  @Post(':id/like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiResponse({
    status: 200,
    description: '좋아요 상태가 성공적으로 변경되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async toggleCommunityLike(@Param('id') id: string, @Res() res: Response) {
    const { userId } = res.locals.user;
    const result = await this.communityService.toggleCommunityLike(
      parseInt(id),
      userId,
    );
    return this.responseService.success(
      res,
      '좋아요 상태가 성공적으로 변경되었습니다.',
      result,
    );
  }

  @Post('comments/:commentId/like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요 토글' })
  @ApiResponse({
    status: 200,
    description: '좋아요 상태가 성공적으로 변경되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다.' })
  async toggleCommentLike(
    @Param('commentId') commentId: string,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const result = await this.communityService.toggleCommentLike(
      parseInt(commentId),
      userId,
    );
    return this.responseService.success(
      res,
      '좋아요 상태가 성공적으로 변경되었습니다.',
      result,
    );
  }
}
