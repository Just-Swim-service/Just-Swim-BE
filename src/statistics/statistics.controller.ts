import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { StatisticsService } from './statistics.service';
import { SkipAuth } from 'src/auth/decorator/skip-auth.decorator';
import { StudentDashboardResponseDto } from './dto/student-dashboard.dto';
import { InstructorDashboardResponseDto } from './dto/instructor-dashboard.dto';
import { RankingResponseDto, RankingType } from './dto/ranking.dto';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('통계/대시보드')
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('student/dashboard')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '수강생 대시보드 조회',
    description:
      '수강생의 피드백 통계, 강의 정보, 커뮤니티 활동, 레벨 및 배지 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '수강생 대시보드 조회 성공',
    type: StudentDashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getStudentDashboard(@Res() res: Response) {
    const { userId } = res.locals.user;
    const data = await this.statisticsService.getStudentDashboard(userId);
    return this.responseService.success(
      res,
      '수강생 대시보드를 조회했습니다.',
      data,
    );
  }

  @Get('instructor/dashboard')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '강사 대시보드 조회',
    description:
      '강사의 강의 통계, 피드백 현황, 커뮤니티 활동, 수강생 성과를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '강사 대시보드 조회 성공',
    type: InstructorDashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getInstructorDashboard(@Res() res: Response) {
    const { userId } = res.locals.user;
    const data = await this.statisticsService.getInstructorDashboard(userId);
    return this.responseService.success(
      res,
      '강사 대시보드를 조회했습니다.',
      data,
    );
  }

  @Get('rankings')
  @SkipAuth()
  @ApiOperation({
    summary: '랭킹 조회',
    description: '다양한 카테고리의 사용자 랭킹을 조회합니다. (로그인 선택)',
  })
  @ApiQuery({
    name: 'type',
    enum: RankingType,
    required: false,
    description: '랭킹 타입 (기본값: student_activity)',
  })
  @ApiQuery({
    name: 'period',
    type: Number,
    required: false,
    description: '조회 기간 (일, 기본값: 30)',
  })
  @ApiResponse({
    status: 200,
    description: '랭킹 조회 성공',
    type: RankingResponseDto,
  })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getRankings(
    @Query('type') type: RankingType = RankingType.STUDENT_ACTIVITY,
    @Query('period') period: number = 30,
    @Res() res: Response,
  ) {
    const currentUserId = res.locals.user?.userId;
    const data = await this.statisticsService.getRankings(
      type,
      period,
      currentUserId,
    );
    return this.responseService.success(res, '랭킹을 조회했습니다.', data);
  }

  @Get('my-level')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 레벨 정보 조회',
    description: '현재 사용자의 레벨, 경험치, 스트릭 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '레벨 정보 조회 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getMyLevel(@Res() res: Response) {
    const { userId } = res.locals.user;
    const dashboard = await this.statisticsService.getStudentDashboard(userId);
    return this.responseService.success(
      res,
      '레벨 정보를 조회했습니다.',
      dashboard.levelInfo,
    );
  }

  @Get('my-badges')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 배지 목록 조회',
    description: '현재 사용자가 획득한 모든 배지를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '배지 목록 조회 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getMyBadges(@Res() res: Response) {
    const { userId } = res.locals.user;
    const dashboard = await this.statisticsService.getStudentDashboard(userId);
    return this.responseService.success(
      res,
      '배지 목록을 조회했습니다.',
      dashboard.badges,
    );
  }
}
