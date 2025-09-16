import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { NotificationService } from './notification.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseService } from 'src/common/response/response.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

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
    description: '사용자의 알림 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 항목 수 (기본값: 20)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['unread', 'read', 'deleted'],
    description: '알림 상태 필터',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['feedback', 'lecture', 'system', 'payment', 'schedule'],
    description: '알림 타입 필터',
  })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getNotifications(
    @Res() res: Response,
    @Query() query: NotificationQueryDto,
  ) {
    const { userId } = res.locals.user;

    const result = await this.notificationService.getNotifications(
      userId,
      query,
    );

    return this.responseService.success(res, '알림 목록 조회 성공', result);
  }

  /* 알림 상세 조회 */
  @Get(':notificationId')
  @ApiOperation({
    summary: '알림 상세 조회',
    description: '특정 알림의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    type: Number,
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
  async getNotification(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const { userId } = res.locals.user;

    const notification = await this.notificationService.getNotification(
      userId,
      notificationId,
    );

    return this.responseService.success(
      res,
      '알림 상세 조회 성공',
      notification,
    );
  }

  /* 알림 읽음 처리 */
  @Patch(':notificationId/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.',
  })
  @ApiParam({
    name: 'notificationId',
    type: Number,
    description: '알림 ID',
  })
  @ApiResponse({ status: 200, description: '알림 읽음 처리 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async markAsRead(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const { userId } = res.locals.user;

    await this.notificationService.markAsRead(userId, notificationId);

    return this.responseService.success(res, '알림 읽음 처리 성공');
  }

  /* 모든 알림 읽음 처리 */
  @Patch('read-all')
  @ApiOperation({
    summary: '모든 알림 읽음 처리',
    description: '사용자의 모든 알림을 읽음 상태로 변경합니다.',
  })
  @ApiResponse({ status: 200, description: '모든 알림 읽음 처리 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
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
    type: Number,
    description: '알림 ID',
  })
  @ApiResponse({ status: 200, description: '알림 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async deleteNotification(
    @Res() res: Response,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const { userId } = res.locals.user;

    await this.notificationService.deleteNotification(userId, notificationId);

    return this.responseService.success(res, '알림 삭제 성공');
  }
}
