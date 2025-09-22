import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { UsersService } from 'src/users/users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';
import { NotificationPriority } from './enum/notification-priority.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: NotificationRepository;
  let usersService: UsersService;

  const mockUser = {
    userId: 1,
    userType: 'customer',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockNotification = {
    notificationId: 1,
    userId: 1,
    notificationType: NotificationType.Feedback,
    notificationStatus: NotificationStatus.Unread,
    notificationPriority: NotificationPriority.Medium,
    notificationTitle: '새로운 피드백이 도착했습니다',
    notificationContent: '김강사님이 새로운 피드백을 작성했습니다.',
    notificationLink: '/feedback/123',
    notificationData: { feedbackId: 123 },
    notificationReadAt: null,
    notificationScheduledAt: null,
    notificationCreatedAt: new Date(),
    notificationUpdatedAt: new Date(),
    user: mockUser,
  };

  const mockNotificationWithoutUser = {
    ...mockNotification,
    user: undefined,
  };

  const mockNotificationRepository = {
    getNotificationsByUserId: jest.fn(),
    getNotificationById: jest.fn(),
    getNotificationByIdAndUserId: jest.fn(),
    createNotification: jest.fn(),
    updateNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    softDeleteNotification: jest.fn(),
    softDeleteAllNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    getScheduledNotifications: jest.fn(),
    deleteOldNotifications: jest.fn(),
    getNotificationStats: jest.fn(),
  };

  const mockUsersService = {
    findUserByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<NotificationRepository>(
      NotificationRepository,
    );
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotificationsByUserId', () => {
    it('사용자의 알림 목록을 페이징하여 조회해야 함', async () => {
      const userId = 1;
      const page = 1;
      const pageSize = 10;
      const mockResult = {
        notifications: [mockNotification],
        totalCount: 1,
        unreadCount: 1,
      };

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);
      mockNotificationRepository.getNotificationsByUserId.mockResolvedValue(
        mockResult,
      );

      const result = await service.getNotificationsByUserId(
        userId,
        page,
        pageSize,
      );

      expect(result).toEqual({
        notifications: [
          expect.objectContaining({
            notificationId: mockNotification.notificationId,
            userId: mockUser.userId,
            notificationType: mockNotification.notificationType,
          }),
        ],
        totalCount: 1,
        unreadCount: 1,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
      expect(mockUsersService.findUserByPk).toHaveBeenCalledWith(userId);
      expect(
        mockNotificationRepository.getNotificationsByUserId,
      ).toHaveBeenCalledWith(userId, page, pageSize, undefined, undefined);
    });

    it('사용자가 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const userId = 999;
      mockUsersService.findUserByPk.mockResolvedValue(null);

      await expect(service.getNotificationsByUserId(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('잘못된 페이지 번호로 요청하면 BadRequestException을 발생시켜야 함', async () => {
      const userId = 1;
      mockUsersService.findUserByPk.mockResolvedValue(mockUser);

      await expect(service.getNotificationsByUserId(userId, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('잘못된 페이지 크기로 요청하면 BadRequestException을 발생시켜야 함', async () => {
      const userId = 1;
      mockUsersService.findUserByPk.mockResolvedValue(mockUser);

      await expect(
        service.getNotificationsByUserId(userId, 1, 101),
      ).rejects.toThrow(BadRequestException);
    });

    it('user 관계가 없는 알림도 안전하게 처리해야 함', async () => {
      const userId = 1;
      const page = 1;
      const pageSize = 10;
      const mockResult = {
        notifications: [mockNotificationWithoutUser],
        totalCount: 1,
        unreadCount: 1,
      };

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);
      mockNotificationRepository.getNotificationsByUserId.mockResolvedValue(
        mockResult,
      );

      const result = await service.getNotificationsByUserId(
        userId,
        page,
        pageSize,
      );

      expect(result).toEqual({
        notifications: [
          expect.objectContaining({
            notificationId: mockNotificationWithoutUser.notificationId,
            userId: mockNotificationWithoutUser.userId, // user 관계가 없어도 userId가 직접 사용됨
            notificationType: mockNotificationWithoutUser.notificationType,
          }),
        ],
        totalCount: 1,
        unreadCount: 1,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });
  });

  describe('getNotificationById', () => {
    it('알림 상세 정보를 조회해야 함', async () => {
      const notificationId = 1;
      const userId = 1;

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        mockNotification,
      );

      const result = await service.getNotificationById(notificationId, userId);

      expect(result).toEqual(
        expect.objectContaining({
          notificationId: mockNotification.notificationId,
          userId: mockUser.userId,
          notificationType: mockNotification.notificationType,
        }),
      );
      expect(
        mockNotificationRepository.getNotificationByIdAndUserId,
      ).toHaveBeenCalledWith(notificationId, userId);
    });

    it('알림이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const notificationId = 999;
      const userId = 1;

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        service.getNotificationById(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createNotification', () => {
    it('새로운 알림을 생성해야 함', async () => {
      const createNotificationDto: CreateNotificationDto = {
        userId: 1,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 피드백이 도착했습니다',
        notificationContent: '김강사님이 새로운 피드백을 작성했습니다.',
        notificationLink: '/feedback/123',
        notificationPriority: NotificationPriority.Medium,
        notificationData: { feedbackId: 123 },
      };

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);
      mockNotificationRepository.createNotification.mockResolvedValue(
        mockNotification,
      );

      const result = await service.createNotification(createNotificationDto);

      expect(result).toEqual(
        expect.objectContaining({
          notificationId: mockNotification.notificationId,
          userId: mockUser.userId,
          notificationType: createNotificationDto.notificationType,
        }),
      );
      expect(mockUsersService.findUserByPk).toHaveBeenCalledWith(
        createNotificationDto.userId,
      );
      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith(createNotificationDto);
    });

    it('사용자가 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const createNotificationDto: CreateNotificationDto = {
        userId: 999,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 피드백이 도착했습니다',
        notificationContent: '김강사님이 새로운 피드백을 작성했습니다.',
      };

      mockUsersService.findUserByPk.mockResolvedValue(null);

      await expect(
        service.createNotification(createNotificationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('과거 시간으로 예약하면 BadRequestException을 발생시켜야 함', async () => {
      const createNotificationDto: CreateNotificationDto = {
        userId: 1,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 피드백이 도착했습니다',
        notificationContent: '김강사님이 새로운 피드백을 작성했습니다.',
        notificationScheduledAt: '2020-01-01T00:00:00Z',
      };

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);

      await expect(
        service.createNotification(createNotificationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateNotification', () => {
    it('알림을 수정해야 함', async () => {
      const notificationId = 1;
      const userId = 1;
      const updateNotificationDto: UpdateNotificationDto = {
        notificationStatus: NotificationStatus.Read,
        notificationTitle: '수정된 제목',
      };

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        mockNotification,
      );
      mockNotificationRepository.updateNotification.mockResolvedValue(
        undefined,
      );
      mockNotificationRepository.getNotificationById.mockResolvedValue({
        ...mockNotification,
        notificationStatus: NotificationStatus.Read,
        notificationTitle: '수정된 제목',
      });

      const result = await service.updateNotification(
        notificationId,
        userId,
        updateNotificationDto,
      );

      expect(result).toEqual(
        expect.objectContaining({
          notificationId: mockNotification.notificationId,
          notificationStatus: NotificationStatus.Read,
          notificationTitle: '수정된 제목',
        }),
      );
      expect(
        mockNotificationRepository.updateNotification,
      ).toHaveBeenCalledWith(notificationId, updateNotificationDto);
    });

    it('알림이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const notificationId = 999;
      const userId = 1;
      const updateNotificationDto: UpdateNotificationDto = {
        notificationStatus: NotificationStatus.Read,
      };

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        service.updateNotification(
          notificationId,
          userId,
          updateNotificationDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('알림을 읽음 처리해야 함', async () => {
      const notificationId = 1;
      const userId = 1;

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        mockNotification,
      );
      mockNotificationRepository.markAsRead.mockResolvedValue(undefined);

      await service.markAsRead(notificationId, userId);

      expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(
        notificationId,
        userId,
      );
    });

    it('알림이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const notificationId = 999;
      const userId = 1;

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(service.markAsRead(notificationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음 처리해야 함', async () => {
      const userId = 1;

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);
      mockNotificationRepository.markAllAsRead.mockResolvedValue(undefined);

      await service.markAllAsRead(userId);

      expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith(
        userId,
      );
    });

    it('사용자가 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const userId = 999;

      mockUsersService.findUserByPk.mockResolvedValue(null);

      await expect(service.markAllAsRead(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteNotification', () => {
    it('알림을 삭제해야 함', async () => {
      const notificationId = 1;
      const userId = 1;

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        mockNotification,
      );
      mockNotificationRepository.softDeleteNotification.mockResolvedValue(
        undefined,
      );

      await service.deleteNotification(notificationId, userId);

      expect(
        mockNotificationRepository.softDeleteNotification,
      ).toHaveBeenCalledWith(notificationId, userId);
    });

    it('알림이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const notificationId = 999;
      const userId = 1;

      mockNotificationRepository.getNotificationByIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(
        service.deleteNotification(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 개수를 조회해야 함', async () => {
      const userId = 1;
      const unreadCount = 5;

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);
      mockNotificationRepository.getUnreadCount.mockResolvedValue(unreadCount);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(unreadCount);
      expect(mockNotificationRepository.getUnreadCount).toHaveBeenCalledWith(
        userId,
      );
    });

    it('사용자가 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const userId = 999;

      mockUsersService.findUserByPk.mockResolvedValue(null);

      await expect(service.getUnreadCount(userId)).rejects.toThrow(
        NotFoundException,
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

      mockUsersService.findUserByPk.mockResolvedValue(mockUser);
      mockNotificationRepository.getNotificationStats.mockResolvedValue(
        mockStats,
      );

      const result = await service.getNotificationStats(userId);

      expect(result).toEqual(mockStats);
      expect(
        mockNotificationRepository.getNotificationStats,
      ).toHaveBeenCalledWith(userId);
    });

    it('사용자가 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      const userId = 999;

      mockUsersService.findUserByPk.mockResolvedValue(null);

      await expect(service.getNotificationStats(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createFeedbackNotification', () => {
    it('피드백 알림을 생성해야 함', async () => {
      const instructorUserId = 1;
      const targetUserIds = [2, 3];
      const feedbackId = 123;
      const lectureTitle = '수영 기초';
      const feedbackContent = '좋은 수영이었습니다.';

      mockNotificationRepository.createNotification.mockResolvedValue(
        mockNotification,
      );

      await service.createFeedbackNotification(
        instructorUserId,
        targetUserIds,
        feedbackId,
        lectureTitle,
        feedbackContent,
      );

      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith({
        userId: 2,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 피드백이 도착했습니다',
        notificationContent: '수영 기초 수업에 대한 피드백이 작성되었습니다.',
        notificationLink: '/feedback/123',
        notificationPriority: 'medium',
        notificationData: {
          feedbackId: 123,
          lectureTitle: '수영 기초',
          instructorUserId: 1,
          preview: '좋은 수영이었습니다.',
        },
      });
    });
  });

  describe('createLectureNotification', () => {
    it('강의 알림을 생성해야 함', async () => {
      const userId = 1;
      const lectureId = 123;
      const lectureTitle = '수영 기초';
      const scheduledTime = new Date('2024-01-01T10:00:00Z');

      mockNotificationRepository.createNotification.mockResolvedValue(
        mockNotification,
      );

      await service.createLectureNotification(
        userId,
        lectureId,
        lectureTitle,
        scheduledTime,
      );

      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith({
        userId: 1,
        notificationType: NotificationType.Lecture,
        notificationTitle: '강의 시작 알림',
        notificationContent: '수영 기초 강의가 곧 시작됩니다.',
        notificationLink: '/lecture/123',
        notificationPriority: 'high',
        notificationScheduledAt: '2024-01-01T10:00:00.000Z',
        notificationData: {
          lectureId: 123,
          lectureTitle: '수영 기초',
          scheduledTime: '2024-01-01T10:00:00.000Z',
        },
      });
    });
  });

  describe('createSystemNotification', () => {
    it('시스템 알림을 생성해야 함', async () => {
      const userId = 1;
      const title = '시스템 점검 안내';
      const content = '시스템 점검으로 인한 서비스 일시 중단 안내드립니다.';
      const link = '/announcement/1';
      const priority = 'high';

      mockNotificationRepository.createNotification.mockResolvedValue(
        mockNotification,
      );

      await service.createSystemNotification(
        userId,
        title,
        content,
        link,
        priority as any,
      );

      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith({
        userId: 1,
        notificationType: NotificationType.System,
        notificationTitle: '시스템 점검 안내',
        notificationContent:
          '시스템 점검으로 인한 서비스 일시 중단 안내드립니다.',
        notificationLink: '/announcement/1',
        notificationPriority: 'high',
        notificationData: {
          systemNotification: true,
          timestamp: expect.any(String),
        },
      });
    });
  });
});
