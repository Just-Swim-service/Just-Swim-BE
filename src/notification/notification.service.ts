import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { Notification } from './entity/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationListDto } from './dto/notification-list.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';
import { UsersService } from 'src/users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly usersService: UsersService,
  ) {}

  /* 알림 목록 조회 (Controller용) */
  async getNotifications(
    userId: number,
    query: NotificationQueryDto,
  ): Promise<{
    notifications: NotificationResponseDto[];
    totalCount: number;
    unreadCount: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await this.getNotificationsByUserId(
      userId,
      page,
      limit,
      query.status,
      query.type,
    );

    return {
      notifications: result.notifications,
      totalCount: result.totalCount,
      unreadCount: result.unreadCount,
    };
  }

  /* 사용자별 알림 목록 조회 */
  async getNotificationsByUserId(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    status?: NotificationStatus,
    type?: NotificationType,
  ): Promise<NotificationListDto> {
    // 사용자 존재 확인
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 페이지 유효성 검사
    if (page < 1) {
      throw new BadRequestException('페이지는 1 이상이어야 합니다.');
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new BadRequestException('페이지 크기는 1-100 사이여야 합니다.');
    }

    const result = await this.notificationRepository.getNotificationsByUserId(
      userId,
      page,
      pageSize,
      status,
      type,
    );

    const totalPages = Math.ceil(result.totalCount / pageSize);

    return {
      notifications: result.notifications.map(this.mapToResponseDto),
      totalCount: result.totalCount,
      unreadCount: result.unreadCount,
      currentPage: page,
      totalPages,
      pageSize,
    };
  }

  /* 알림 상세 조회 (Controller용) */
  async getNotification(
    userId: number,
    notificationId: number,
  ): Promise<NotificationResponseDto> {
    return this.getNotificationById(notificationId, userId);
  }

  /* 알림 상세 조회 */
  async getNotificationById(
    notificationId: number,
    userId: number,
  ): Promise<NotificationResponseDto> {
    const notification =
      await this.notificationRepository.getNotificationByIdAndUserId(
        notificationId,
        userId,
      );

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    return this.mapToResponseDto(notification);
  }

  /* 알림 생성 */
  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    // 사용자 존재 확인
    const user = await this.usersService.findUserByPk(
      createNotificationDto.userId,
    );
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 예약 시간 검증
    if (createNotificationDto.notificationScheduledAt) {
      const scheduledTime = new Date(
        createNotificationDto.notificationScheduledAt,
      );
      const now = new Date();

      if (scheduledTime <= now) {
        throw new BadRequestException(
          '예약 시간은 현재 시간보다 미래여야 합니다.',
        );
      }
    }

    const notification = await this.notificationRepository.createNotification(
      createNotificationDto,
    );
    return this.mapToResponseDto(notification);
  }

  /* 알림 수정 */
  async updateNotification(
    notificationId: number,
    userId: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification =
      await this.notificationRepository.getNotificationByIdAndUserId(
        notificationId,
        userId,
      );

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    // 예약 시간 검증
    if (updateNotificationDto.notificationScheduledAt) {
      const scheduledTime = new Date(
        updateNotificationDto.notificationScheduledAt,
      );
      const now = new Date();

      if (scheduledTime <= now) {
        throw new BadRequestException(
          '예약 시간은 현재 시간보다 미래여야 합니다.',
        );
      }
    }

    await this.notificationRepository.updateNotification(
      notificationId,
      updateNotificationDto,
    );

    const updatedNotification =
      await this.notificationRepository.getNotificationById(notificationId);
    return this.mapToResponseDto(updatedNotification!);
  }

  /* 알림 읽음 처리 */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification =
      await this.notificationRepository.getNotificationByIdAndUserId(
        notificationId,
        userId,
      );

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    await this.notificationRepository.markAsRead(notificationId, userId);
  }

  /* 모든 알림 읽음 처리 */
  async markAllAsRead(userId: number): Promise<void> {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.notificationRepository.markAllAsRead(userId);
  }

  /* 알림 삭제 */
  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    const notification =
      await this.notificationRepository.getNotificationByIdAndUserId(
        notificationId,
        userId,
      );

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    await this.notificationRepository.softDeleteNotification(
      notificationId,
      userId,
    );
  }

  /* 모든 알림 삭제 */
  async deleteAllNotifications(userId: number): Promise<void> {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.notificationRepository.softDeleteAllNotifications(userId);
  }

  /* 읽지 않은 알림 개수 조회 */
  async getUnreadCount(userId: number): Promise<number> {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return await this.notificationRepository.getUnreadCount(userId);
  }

  /* 알림 통계 조회 */
  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return await this.notificationRepository.getNotificationStats(userId);
  }

  /* 피드백 알림 생성 (피드백 작성 시 자동 호출) */
  async createFeedbackNotification(
    instructorUserId: number,
    targetUserIds: number[],
    feedbackId: number,
    lectureTitle: string,
    feedbackContent: string,
  ): Promise<void> {
    const notifications = targetUserIds.map((userId) => ({
      userId,
      notificationType: NotificationType.Feedback,
      notificationTitle: '새로운 피드백이 도착했습니다',
      notificationContent: `${lectureTitle} 수업에 대한 피드백이 작성되었습니다.`,
      notificationLink: `/feedback/${feedbackId}`,
      notificationPriority: 'medium' as any,
      notificationData: {
        feedbackId,
        lectureTitle,
        instructorUserId,
        preview:
          feedbackContent.substring(0, 100) +
          (feedbackContent.length > 100 ? '...' : ''),
      },
    }));

    await Promise.all(
      notifications.map((notification) =>
        this.notificationRepository.createNotification(notification),
      ),
    );
  }

  /* 강의 알림 생성 (강의 시작 전 알림) */
  async createLectureNotification(
    userId: number,
    lectureId: number,
    lectureTitle: string,
    scheduledTime: Date,
  ): Promise<void> {
    const notification = {
      userId,
      notificationType: NotificationType.Lecture,
      notificationTitle: '강의 시작 알림',
      notificationContent: `${lectureTitle} 강의가 곧 시작됩니다.`,
      notificationLink: `/lecture/${lectureId}`,
      notificationPriority: 'high' as any,
      notificationScheduledAt: scheduledTime.toISOString(),
      notificationData: {
        lectureId,
        lectureTitle,
        scheduledTime: scheduledTime.toISOString(),
      },
    };

    await this.notificationRepository.createNotification(notification);
  }

  /* 시스템 알림 생성 */
  async createSystemNotification(
    userId: number,
    title: string,
    content: string,
    link?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ): Promise<void> {
    const notification = {
      userId,
      notificationType: NotificationType.System,
      notificationTitle: title,
      notificationContent: content,
      notificationLink: link,
      notificationPriority: priority as any,
      notificationData: {
        systemNotification: true,
        timestamp: new Date().toISOString(),
      },
    };

    await this.notificationRepository.createNotification(notification);
  }

  /* 예약된 알림 처리 (스케줄러) */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    const scheduledNotifications =
      await this.notificationRepository.getScheduledNotifications();

    for (const notification of scheduledNotifications) {
      // 여기서 실제 알림 발송 로직을 구현할 수 있습니다
      // 예: 이메일, SMS, 푸시 알림 등
      console.log(
        `Processing scheduled notification: ${notification.notificationId}`,
      );

      // 예약된 알림을 즉시 발송 상태로 변경
      await this.notificationRepository.updateNotification(
        notification.notificationId,
        {
          notificationScheduledAt: null, // 예약 시간 제거
        },
      );
    }
  }

  /* 오래된 알림 정리 (스케줄러) */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldNotifications(): Promise<void> {
    const deletedCount =
      await this.notificationRepository.deleteOldNotifications(30);
    console.log(`Cleaned up ${deletedCount} old notifications`);
  }

  /* Entity를 ResponseDto로 변환 */
  private mapToResponseDto(
    notification: Notification,
  ): NotificationResponseDto {
    return {
      notificationId: notification.notificationId,
      userId: notification.user.userId,
      notificationType: notification.notificationType,
      notificationStatus: notification.notificationStatus,
      notificationPriority: notification.notificationPriority,
      notificationTitle: notification.notificationTitle,
      notificationContent: notification.notificationContent,
      notificationLink: notification.notificationLink,
      notificationData: notification.notificationData,
      notificationReadAt: notification.notificationReadAt,
      notificationScheduledAt: notification.notificationScheduledAt,
      notificationCreatedAt: notification.notificationCreatedAt,
      notificationUpdatedAt: notification.notificationUpdatedAt,
    };
  }
}
