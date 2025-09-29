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
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록을 성공적으로 조회했습니다.',
  })
  async findAllCommunities(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Res() res: Response,
  ) {
    const result = await this.communityService.findAllCommunities(
      parseInt(page),
      parseInt(limit),
    );
    return this.responseService.success(
      res,
      '게시글 목록을 성공적으로 조회했습니다.',
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
