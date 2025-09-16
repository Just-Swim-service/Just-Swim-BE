import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ResponseService } from 'src/common/response/response.service';
import { Response } from 'express';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type.enum';
import { NotificationPriority } from './enum/notification-priority.enum';
import { NotificationQueryDto } from './dto/notification-query.dto';

class MockNotificationService {
  getNotifications = jest.fn();
  getNotification = jest.fn();
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

  const mockNotificationResponse = {
    notifications: [mockNotification],
    totalCount: 1,
    unreadCount: 1,
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

      const query: NotificationQueryDto = { page: 1, limit: 20 };

      notificationService.getNotifications.mockResolvedValue(
        mockNotificationResponse,
      );

      await controller.getNotifications(res as Response, query);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 목록 조회 성공',
        mockNotificationResponse,
      );
      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        mockUser.userId,
        query,
      );
    });

    it('쿼리 파라미터를 포함하여 알림 목록을 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const query: NotificationQueryDto = {
        page: 2,
        limit: 20,
        status: NotificationStatus.Unread,
        type: NotificationType.Feedback,
      };

      notificationService.getNotifications.mockResolvedValue(
        mockNotificationResponse,
      );

      await controller.getNotifications(res as Response, query);

      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        mockUser.userId,
        query,
      );
    });
  });

  describe('getNotification', () => {
    it('알림 상세 정보를 조회해야 함', async () => {
      const res: Partial<Response> = {
        locals: { user: mockUser },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const notificationId = 1;

      notificationService.getNotification.mockResolvedValue(mockNotification);

      await controller.getNotification(res as Response, notificationId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '알림 상세 조회 성공',
        mockNotification,
      );
      expect(notificationService.getNotification).toHaveBeenCalledWith(
        mockUser.userId,
        notificationId,
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
        mockUser.userId,
        notificationId,
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
});
