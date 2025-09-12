import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseService } from 'src/common/response/response.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationListDto } from './dto/notification-list.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
  ) {}

  /* 알림 목록 조회 */
  @Get()
  @ApiOperation({
    summary: '알림 목록 조회',
    description: '사용자의 알림 목록을 페이징하여 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: '페이지 번호 (기본값: 1)',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: 'number',
    description: '페이지 크기 (기본값: 10, 최대: 100)',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    enum: NotificationStatus,
    description: '알림 상태 필터',
    required: false,
  })
  @ApiQuery({
    name: 'type',
    enum: NotificationType,
    description: '알림 타입 필터',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: NotificationListDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getNotifications(
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
  ) {
    const { userId } = res.locals.user;
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    const notifications =
      await this.notificationService.getNotificationsByUserId(
        userId,
        pageNum,
        pageSizeNum,
        status,
        type,
      );

    return this.responseService.success(
      res,
      '알림 목록 조회 성공',
      notifications,
    );
  }

  /* 알림 상세 조회 */
  @Get(':notificationId')
  @ApiOperation({
    summary: '알림 상세 조회',
    description: '특정 알림의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    type: 'number',
    description: '알림 ID',
  })
  @ApiResponse({
    status: 200,
    description: '알림 상세 조회 성공',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getNotificationDetail(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const { userId } = res.locals.user;

    const notification = await this.notificationService.getNotificationById(
      notificationId,
      userId,
    );

    return this.responseService.success(
      res,
      '알림 상세 조회 성공',
      notification,
    );
  }

  /* 알림 생성 */
  @Post()
  @ApiOperation({
    summary: '알림 생성',
    description: '새로운 알림을 생성합니다.',
  })
  @ApiBody({
    description: '알림 생성 정보',
    type: CreateNotificationDto,
  })
  @ApiResponse({
    status: 201,
    description: '알림 생성 성공',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async createNotification(
    @Res() res: Response,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const notification = await this.notificationService.createNotification(
      createNotificationDto,
    );

    return this.responseService.success(res, '알림 생성 성공', notification);
  }

  /* 알림 수정 */
  @Patch(':notificationId')
  @ApiOperation({
    summary: '알림 수정',
    description: '기존 알림을 수정합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    type: 'number',
    description: '알림 ID',
  })
  @ApiBody({
    description: '알림 수정 정보',
    type: UpdateNotificationDto,
  })
  @ApiResponse({
    status: 200,
    description: '알림 수정 성공',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async updateNotification(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const { userId } = res.locals.user;

    const notification = await this.notificationService.updateNotification(
      notificationId,
      userId,
      updateNotificationDto,
    );

    return this.responseService.success(res, '알림 수정 성공', notification);
  }

  /* 알림 읽음 처리 */
  @Patch(':notificationId/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    type: 'number',
    description: '알림 ID',
  })
  @ApiResponse({ status: 200, description: '알림 읽음 처리 성공' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async markAsRead(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const { userId } = res.locals.user;

    await this.notificationService.markAsRead(notificationId, userId);

    return this.responseService.success(res, '알림 읽음 처리 성공');
  }

  /* 모든 알림 읽음 처리 */
  @Patch('read-all')
  @ApiOperation({
    summary: '모든 알림 읽음 처리',
    description: '사용자의 모든 읽지 않은 알림을 읽음 상태로 변경합니다.',
  })
  @ApiResponse({ status: 200, description: '모든 알림 읽음 처리 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async markAllAsRead(@Res() res: Response) {
    const { userId } = res.locals.user;

    await this.notificationService.markAllAsRead(userId);

    return this.responseService.success(res, '모든 알림 읽음 처리 성공');
  }

  /* 알림 삭제 */
  @Delete(':notificationId')
  @ApiOperation({
    summary: '알림 삭제',
    description: '특정 알림을 삭제합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    type: 'number',
    description: '알림 ID',
  })
  @ApiResponse({ status: 200, description: '알림 삭제 성공' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async deleteNotification(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const { userId } = res.locals.user;

    await this.notificationService.deleteNotification(notificationId, userId);

    return this.responseService.success(res, '알림 삭제 성공');
  }

  /* 모든 알림 삭제 */
  @Delete()
  @ApiOperation({
    summary: '모든 알림 삭제',
    description: '사용자의 모든 알림을 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '모든 알림 삭제 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async deleteAllNotifications(@Res() res: Response) {
    const { userId } = res.locals.user;

    await this.notificationService.deleteAllNotifications(userId);

    return this.responseService.success(res, '모든 알림 삭제 성공');
  }

  /* 읽지 않은 알림 개수 조회 */
  @Get('unread/count')
  @ApiOperation({
    summary: '읽지 않은 알림 개수 조회',
    description: '사용자의 읽지 않은 알림 개수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '읽지 않은 알림 개수 조회 성공',
    schema: {
      type: 'object',
      properties: {
        unreadCount: {
          type: 'number',
          description: '읽지 않은 알림 개수',
          example: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getUnreadCount(@Res() res: Response) {
    const { userId } = res.locals.user;

    const unreadCount = await this.notificationService.getUnreadCount(userId);

    return this.responseService.success(res, '읽지 않은 알림 개수 조회 성공', {
      unreadCount,
    });
  }

  /* 알림 통계 조회 */
  @Get('stats')
  @ApiOperation({
    summary: '알림 통계 조회',
    description: '사용자의 알림 통계를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알림 통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: '전체 알림 수' },
        unread: { type: 'number', description: '읽지 않은 알림 수' },
        byType: {
          type: 'object',
          description: '타입별 알림 수',
          example: { feedback: 10, lecture: 5, system: 3 },
        },
        byPriority: {
          type: 'object',
          description: '우선순위별 알림 수',
          example: { low: 5, medium: 10, high: 3 },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getNotificationStats(@Res() res: Response) {
    const { userId } = res.locals.user;

    const stats = await this.notificationService.getNotificationStats(userId);

    return this.responseService.success(res, '알림 통계 조회 성공', stats);
  }
}
