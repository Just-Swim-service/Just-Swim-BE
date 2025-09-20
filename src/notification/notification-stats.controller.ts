import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { NotificationService } from './notification.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('Notification Stats')
@Controller('notification/stats')
export class NotificationStatsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
  ) {}

  /* 읽지 않은 알림 개수 조회 */
  @Get('unread-count')
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
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @ApiBearerAuth('accessToken')
  async getUnreadCount(@Res() res: Response) {
    try {
      const { userId } = res.locals.user;

      const unreadCount = await this.notificationService.getUnreadCount(userId);

      return this.responseService.success(
        res,
        '읽지 않은 알림 개수 조회 성공',
        {
          unreadCount,
        },
      );
    } catch (error) {
      console.error(
        '🔔 [NotificationStatsController] getUnreadCount 에러:',
        error,
      );
      throw error;
    }
  }
}
