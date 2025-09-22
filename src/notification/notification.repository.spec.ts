import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRepository } from './notification.repository';
import { Notification } from './entity/notification.entity';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';
import { NotificationPriority } from './enum/notification-priority.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let mockRepository: Repository<Notification>;

  const mockNotification = {
    notificationId: 1,
    userId: 1,
    notificationType: NotificationType.Feedback,
    notificationStatus: NotificationStatus.Unread,
    notificationPriority: NotificationPriority.Medium,
    notificationTitle: '테스트 알림',
    notificationContent: '테스트 알림 내용입니다.',
    notificationLink: '/test',
    notificationData: { testId: 123 },
    notificationReadAt: null,
    notificationScheduledAt: null,
    notificationCreatedAt: new Date(),
    notificationUpdatedAt: new Date(),
    notificationDeletedAt: null,
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    getOne: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
    mockRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getNotificationsByUserId', () => {
    it('사용자별 알림 목록을 페이징하여 조회해야 함', async () => {
      const userId = 1;
      const page = 1;
      const pageSize = 10;
      const mockResult = {
        notifications: [mockNotification],
        totalCount: 1,
        unreadCount: 1,
      };

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockNotification]);

      const result = await repository.getNotificationsByUserId(
        userId,
        page,
        pageSize,
      );

      expect(result).toEqual(mockResult);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.userId = :userId',
        { userId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notificationDeletedAt IS NULL',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'notification.user',
        'user',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'notification.notificationCreatedAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(pageSize);
    });

    it('상태와 타입 필터를 적용하여 조회해야 함', async () => {
      const userId = 1;
      const page = 1;
      const pageSize = 10;
      const status = NotificationStatus.Unread;
      const type = NotificationType.Feedback;

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockNotification]);

      await repository.getNotificationsByUserId(
        userId,
        page,
        pageSize,
        status,
        type,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notificationStatus = :status',
        { status },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notificationType = :type',
        { type },
      );
    });
  });

  describe('getNotificationById', () => {
    it('알림 ID로 알림을 조회해야 함', async () => {
      const notificationId = 1;

      mockQueryBuilder.getOne.mockResolvedValue(mockNotification);

      const result = await repository.getNotificationById(notificationId);

      expect(result).toEqual(mockNotification);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.notificationId = :notificationId',
        { notificationId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notificationDeletedAt IS NULL',
      );
    });

    it('존재하지 않는 알림 ID로 조회 시 null 반환', async () => {
      const notificationId = 999;

      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await repository.getNotificationById(notificationId);

      expect(result).toBeNull();
    });
  });

  describe('getNotificationByIdAndUserId', () => {
    it('사용자 ID와 알림 ID로 알림을 조회해야 함', async () => {
      const notificationId = 1;
      const userId = 1;

      mockQueryBuilder.getOne.mockResolvedValue(mockNotification);

      const result = await repository.getNotificationByIdAndUserId(
        notificationId,
        userId,
      );

      expect(result).toEqual(mockNotification);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.notificationId = :notificationId',
        { notificationId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.userId = :userId',
        { userId },
      );
    });
  });

  describe('createNotification', () => {
    it('새로운 알림을 생성해야 함', async () => {
      const createNotificationDto: CreateNotificationDto = {
        userId: 1,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 알림',
        notificationContent: '새로운 알림 내용입니다.',
        notificationLink: '/test',
        notificationPriority: NotificationPriority.Medium,
        notificationData: { testId: 123 },
        notificationScheduledAt: '2024-01-01T10:00:00Z',
      };

      const createdNotification = {
        ...mockNotification,
        ...createNotificationDto,
        notificationScheduledAt: new Date(
          createNotificationDto.notificationScheduledAt!,
        ),
      };

      (mockRepository.create as jest.Mock).mockReturnValue(createdNotification);
      (mockRepository.save as jest.Mock).mockResolvedValue(createdNotification);

      const result = await repository.createNotification(createNotificationDto);

      expect(result).toEqual(createdNotification);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createNotificationDto,
        notificationScheduledAt: new Date(
          createNotificationDto.notificationScheduledAt!,
        ),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdNotification);
    });

    it('예약 시간이 없는 알림을 생성해야 함', async () => {
      const createNotificationDto: CreateNotificationDto = {
        userId: 1,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 알림',
        notificationContent: '새로운 알림 내용입니다.',
      };

      const createdNotification = {
        ...mockNotification,
        ...createNotificationDto,
        notificationScheduledAt: null,
      };

      (mockRepository.create as jest.Mock).mockReturnValue(createdNotification);
      (mockRepository.save as jest.Mock).mockResolvedValue(createdNotification);

      const result = await repository.createNotification(createNotificationDto);

      expect(result).toEqual(createdNotification);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createNotificationDto,
        notificationScheduledAt: null,
      });
    });
  });

  describe('updateNotification', () => {
    it('알림을 수정해야 함', async () => {
      const notificationId = 1;
      const updateNotificationDto: UpdateNotificationDto = {
        notificationStatus: NotificationStatus.Read,
        notificationTitle: '수정된 제목',
        notificationScheduledAt: '2024-01-01T15:00:00Z',
      };

      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.updateNotification(
        notificationId,
        updateNotificationDto,
      );

      expect(mockRepository.update).toHaveBeenCalledWith(notificationId, {
        notificationStatus: NotificationStatus.Read,
        notificationTitle: '수정된 제목',
        notificationScheduledAt: new Date(
          updateNotificationDto.notificationScheduledAt!,
        ),
        notificationReadAt: expect.any(Date),
      });
    });

    it('읽음 처리 시 읽은 시간을 설정해야 함', async () => {
      const notificationId = 1;
      const updateNotificationDto: UpdateNotificationDto = {
        notificationStatus: NotificationStatus.Read,
      };

      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.updateNotification(
        notificationId,
        updateNotificationDto,
      );

      expect(mockRepository.update).toHaveBeenCalledWith(notificationId, {
        notificationStatus: NotificationStatus.Read,
        notificationReadAt: expect.any(Date),
      });
    });
  });

  describe('markAsRead', () => {
    it('알림을 읽음 처리해야 함', async () => {
      const notificationId = 1;
      const userId = 1;

      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.markAsRead(notificationId, userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { notificationId, user: { userId } },
        {
          notificationStatus: NotificationStatus.Read,
          notificationReadAt: expect.any(Date),
        },
      );
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음 처리해야 함', async () => {
      const userId = 1;

      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 5 });

      await repository.markAllAsRead(userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { user: { userId }, notificationStatus: NotificationStatus.Unread },
        {
          notificationStatus: NotificationStatus.Read,
          notificationReadAt: expect.any(Date),
        },
      );
    });
  });

  describe('softDeleteNotification', () => {
    it('알림을 소프트 삭제해야 함', async () => {
      const notificationId = 1;
      const userId = 1;

      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.softDeleteNotification(notificationId, userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { notificationId, user: { userId } },
        { notificationDeletedAt: expect.any(Date) },
      );
    });
  });

  describe('softDeleteAllNotifications', () => {
    it('모든 알림을 소프트 삭제해야 함', async () => {
      const userId = 1;

      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 10 });

      await repository.softDeleteAllNotifications(userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { user: { userId }, notificationDeletedAt: null },
        { notificationDeletedAt: expect.any(Date) },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 개수를 조회해야 함', async () => {
      const userId = 1;
      const unreadCount = 5;

      mockQueryBuilder.getCount.mockResolvedValue(unreadCount);

      const result = await repository.getUnreadCount(userId);

      expect(result).toBe(unreadCount);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.userId = :userId',
        { userId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notificationStatus = :status',
        { status: NotificationStatus.Unread },
      );
    });
  });

  describe('getScheduledNotifications', () => {
    it('예약된 알림을 조회해야 함', async () => {
      const scheduledNotifications = [mockNotification];

      mockQueryBuilder.getMany.mockResolvedValue(scheduledNotifications);

      const result = await repository.getScheduledNotifications();

      expect(result).toEqual(scheduledNotifications);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.notificationScheduledAt IS NOT NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notificationScheduledAt <= :now',
        { now: expect.any(Date) },
      );
    });
  });

  describe('deleteOldNotifications', () => {
    it('오래된 알림을 삭제해야 함', async () => {
      const daysOld = 30;
      const deletedCount = 5;

      mockQueryBuilder.execute.mockResolvedValue({ affected: deletedCount });

      const result = await repository.deleteOldNotifications(daysOld);

      expect(result).toBe(deletedCount);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        notificationDeletedAt: expect.any(Date),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notificationStatus = :status',
        { status: NotificationStatus.Read },
      );
    });
  });

  describe('getNotificationStats', () => {
    it('알림 통계를 조회해야 함', async () => {
      const userId = 1;
      const mockStats = {
        total: 10,
        unread: 3,
        byType: { feedback: 5, lecture: 3, system: 2 },
        byPriority: { low: 2, medium: 6, high: 2 },
      };

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3); // unread

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { type: 'feedback', count: '5' },
          { type: 'lecture', count: '3' },
          { type: 'system', count: '2' },
        ]) // type stats
        .mockResolvedValueOnce([
          { priority: 'low', count: '2' },
          { priority: 'medium', count: '6' },
          { priority: 'high', count: '2' },
        ]); // priority stats

      const result = await repository.getNotificationStats(userId);

      expect(result).toEqual(mockStats);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'notification.notificationType',
        'type',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(*)',
        'count',
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith(
        'notification.notificationType',
      );
    });
  });
});
