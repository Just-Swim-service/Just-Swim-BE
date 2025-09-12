import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ResponseService } from 'src/common/response/response.service';
import { Response } from 'express';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';
import { NotificationPriority } from './enum/notification-priority.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

class MockNotificationService {
  getNotificationsByUserId = jest.fn();
  getNotificationById = jest.fn();
  createNotification = jest.fn();
  updateNotification = jest.fn();
  markAsRead = jest.fn();
  markAllAsRead = jest.fn();
  deleteNotification = jest.fn();
  deleteAllNotifications = jest.fn();
  getUnreadCount = jest.fn();
  getNotificationStats = jest.fn();
}

class MockResponseService {
  success = jest.fn();
  error = jest.fn();
  unauthorized = jest.fn();
  notFound = jest.fn();
  conflict = jest.fn();
  forbidden = jest.fn();
  internalServerError = jest.fn();
}

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: MockNotificationService;
  let responseService: MockResponseService;

  const mockUser = {
    userId: 1,
    userType: 'customer',
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
  };

  const mockNotificationList = {
    notifications: [mockNotification],
    totalCount: 1,
    unreadCount: 1,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: ResponseService, useClass: MockResponseService },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<
      NotificationService,
      MockNotificationService
    >(NotificationService);
    responseService = module.get<ResponseService, MockResponseService>(
      ResponseService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('알림 목록을 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      notificationService.getNotificationsByUserId.mockResolvedValue(
        mockNotificationList,
      );

      await controller.getNotifications(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 목록 조회 성공',
        mockNotificationList,
      );
      expect(notificationService.getNotificationsByUserId).toHaveBeenCalledWith(
        mockUser.userId,
        1,
        10,
        undefined,
        undefined,
      );
    });

    it('쿼리 파라미터를 포함하여 알림 목록을 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      notificationService.getNotificationsByUserId.mockResolvedValue(
        mockNotificationList,
      );

      await controller.getNotifications(
        res as Response,
        '2',
        '20',
        NotificationStatus.Unread,
        NotificationType.Feedback,
      );

      expect(notificationService.getNotificationsByUserId).toHaveBeenCalledWith(
        mockUser.userId,
        2,
        20,
        NotificationStatus.Unread,
        NotificationType.Feedback,
      );
    });
  });

  describe('getNotificationDetail', () => {
    it('알림 상세 정보를 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const notificationId = 1;

      notificationService.getNotificationById.mockResolvedValue(
        mockNotification,
      );

      await controller.getNotificationDetail(res as Response, notificationId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 상세 조회 성공',
        mockNotification,
      );
      expect(notificationService.getNotificationById).toHaveBeenCalledWith(
        notificationId,
        mockUser.userId,
      );
    });
  });

  describe('createNotification', () => {
    it('새로운 알림을 생성해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const createNotificationDto: CreateNotificationDto = {
        userId: 1,
        notificationType: NotificationType.Feedback,
        notificationTitle: '새로운 피드백이 도착했습니다',
        notificationContent: '김강사님이 새로운 피드백을 작성했습니다.',
        notificationLink: '/feedback/123',
        notificationPriority: NotificationPriority.Medium,
        notificationData: { feedbackId: 123 },
      };

      notificationService.createNotification.mockResolvedValue(
        mockNotification,
      );

      await controller.createNotification(
        res as Response,
        createNotificationDto,
      );

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 생성 성공',
        mockNotification,
      );
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        createNotificationDto,
      );
    });
  });

  describe('updateNotification', () => {
    it('알림을 수정해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const notificationId = 1;
      const updateNotificationDto: UpdateNotificationDto = {
        notificationStatus: NotificationStatus.Read,
        notificationTitle: '수정된 제목',
      };

      const updatedNotification = {
        ...mockNotification,
        notificationStatus: NotificationStatus.Read,
        notificationTitle: '수정된 제목',
      };

      notificationService.updateNotification.mockResolvedValue(
        updatedNotification,
      );

      await controller.updateNotification(
        res as Response,
        notificationId,
        updateNotificationDto,
      );

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 수정 성공',
        updatedNotification,
      );
      expect(notificationService.updateNotification).toHaveBeenCalledWith(
        notificationId,
        mockUser.userId,
        updateNotificationDto,
      );
    });
  });

  describe('markAsRead', () => {
    it('알림을 읽음 처리해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const notificationId = 1;

      notificationService.markAsRead.mockResolvedValue(undefined);

      await controller.markAsRead(res as Response, notificationId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 읽음 처리 성공',
      );
      expect(notificationService.markAsRead).toHaveBeenCalledWith(
        notificationId,
        mockUser.userId,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음 처리해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      notificationService.markAllAsRead.mockResolvedValue(undefined);

      await controller.markAllAsRead(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '모든 알림 읽음 처리 성공',
      );
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(
        mockUser.userId,
      );
    });
  });

  describe('deleteNotification', () => {
    it('알림을 삭제해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const notificationId = 1;

      notificationService.deleteNotification.mockResolvedValue(undefined);

      await controller.deleteNotification(res as Response, notificationId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 삭제 성공',
      );
      expect(notificationService.deleteNotification).toHaveBeenCalledWith(
        notificationId,
        mockUser.userId,
      );
    });
  });

  describe('deleteAllNotifications', () => {
    it('모든 알림을 삭제해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      notificationService.deleteAllNotifications.mockResolvedValue(undefined);

      await controller.deleteAllNotifications(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '모든 알림 삭제 성공',
      );
      expect(notificationService.deleteAllNotifications).toHaveBeenCalledWith(
        mockUser.userId,
      );
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 개수를 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const unreadCount = 5;

      notificationService.getUnreadCount.mockResolvedValue(unreadCount);

      await controller.getUnreadCount(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '읽지 않은 알림 개수 조회 성공',
        { unreadCount },
      );
      expect(notificationService.getUnreadCount).toHaveBeenCalledWith(
        mockUser.userId,
      );
    });
  });

  describe('getNotificationStats', () => {
    it('알림 통계를 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const stats = {
        total: 10,
        unread: 3,
        byType: { feedback: 5, lecture: 3, system: 2 },
        byPriority: { low: 2, medium: 6, high: 2 },
      };

      notificationService.getNotificationStats.mockResolvedValue(stats);

      await controller.getNotificationStats(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 통계 조회 성공',
        stats,
      );
      expect(notificationService.getNotificationStats).toHaveBeenCalledWith(
        mockUser.userId,
      );
    });
  });
});
