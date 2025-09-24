import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /* 사용자별 알림 목록 조회 (페이징) */
  async getNotificationsByUserId(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    status?: NotificationStatus,
    type?: NotificationType,
  ): Promise<{
    notifications: Notification[];
    totalCount: number;
    unreadCount: number;
  }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.notificationDeletedAt IS NULL');

    // status가 명시적으로 제공되지 않으면 기본적으로 unread만 조회
    if (status !== undefined) {
      queryBuilder.andWhere('notification.notificationStatus = :status', {
        status,
      });
    } else {
      // 기본적으로 read 상태는 제외하고 조회
      queryBuilder.andWhere('notification.notificationStatus != :readStatus', {
        readStatus: NotificationStatus.Read,
      });
    }

    if (type) {
      queryBuilder.andWhere('notification.notificationType = :type', { type });
    }

    // 필터링된 알림 개수 조회 (read 상태 제외)
    const totalCount = await queryBuilder.getCount();

    // 읽지 않은 알림 개수 조회
    const unreadCount = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.notificationStatus = :status', {
        status: NotificationStatus.Unread,
      })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .getCount();

    // 알림 목록 조회 (최신순) - user 관계 포함
    const notifications = await queryBuilder
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.notificationCreatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      notifications,
      totalCount,
      unreadCount,
    };
  }

  /* 알림 상세 조회 */
  async getNotificationById(
    notificationId: number,
  ): Promise<Notification | null> {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.notificationId = :notificationId', {
        notificationId,
      })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .getOne();
  }

  /* 사용자별 알림 상세 조회 (권한 확인) */
  async getNotificationByIdAndUserId(
    notificationId: number,
    userId: number,
  ): Promise<Notification | null> {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.notificationId = :notificationId', {
        notificationId,
      })
      .andWhere('notification.userId = :userId', { userId })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .getOne();
  }

  /* 알림 생성 */
  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      notificationScheduledAt: createNotificationDto.notificationScheduledAt
        ? new Date(createNotificationDto.notificationScheduledAt)
        : null,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    return savedNotification;
  }

  /* 알림 수정 */
  async updateNotification(
    notificationId: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<void> {
    const updateData: any = { ...updateNotificationDto };

    if (updateNotificationDto.notificationScheduledAt) {
      updateData.notificationScheduledAt = new Date(
        updateNotificationDto.notificationScheduledAt,
      );
    }

    // 읽음 처리 시 읽은 시간 설정
    if (updateNotificationDto.notificationStatus === NotificationStatus.Read) {
      updateData.notificationReadAt = new Date();
    }

    await this.notificationRepository.update(notificationId, updateData);
  }

  /* 알림 읽음 처리 */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationRepository.update(
      { notificationId, user: { userId } },
      {
        notificationStatus: NotificationStatus.Read,
        notificationReadAt: new Date(),
      },
    );
  }

  /* 모든 알림 읽음 처리 */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user: { userId }, notificationStatus: NotificationStatus.Unread },
      {
        notificationStatus: NotificationStatus.Read,
        notificationReadAt: new Date(),
      },
    );
  }

  /* 알림 삭제 (soft delete) */
  async softDeleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    await this.notificationRepository.update(
      { notificationId, user: { userId } },
      { notificationDeletedAt: new Date() },
    );
  }

  /* 모든 알림 삭제 (soft delete) */
  async softDeleteAllNotifications(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user: { userId }, notificationDeletedAt: null },
      { notificationDeletedAt: new Date() },
    );
  }

  /* 읽지 않은 알림 개수 조회 */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.notificationStatus = :status', {
          status: NotificationStatus.Unread,
        })
        .andWhere('notification.notificationDeletedAt IS NULL')
        .getCount();

      return count;
    } catch (error) {
      console.error('🔔 [NotificationRepository] getUnreadCount 에러:', error);
      throw error;
    }
  }

  /* 예약된 알림 조회 (스케줄러용) */
  async getScheduledNotifications(): Promise<Notification[]> {
    const now = new Date();
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.notificationScheduledAt IS NOT NULL')
      .andWhere('notification.notificationScheduledAt <= :now', { now })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .orderBy('notification.notificationScheduledAt', 'ASC')
      .getMany();
  }

  /* 오래된 알림 삭제 (30일 이상 된 읽은 알림) */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ notificationDeletedAt: new Date() })
      .where('notificationStatus = :status', {
        status: NotificationStatus.Read,
      })
      .andWhere('notificationReadAt < :cutoffDate', { cutoffDate })
      .andWhere('notificationDeletedAt IS NULL')
      .execute();

    return result.affected || 0;
  }

  /* 알림 통계 조회 */
  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const total = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .getCount();

    const unread = await this.getUnreadCount(userId);

    // 타입별 통계
    const typeStats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.notificationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .groupBy('notification.notificationType')
      .getRawMany();

    const byType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // 우선순위별 통계
    const priorityStats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.notificationPriority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.notificationDeletedAt IS NULL')
      .groupBy('notification.notificationPriority')
      .getRawMany();

    const byPriority = priorityStats.reduce((acc, stat) => {
      acc[stat.priority] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      unread,
      byType,
      byPriority,
    };
  }
}
