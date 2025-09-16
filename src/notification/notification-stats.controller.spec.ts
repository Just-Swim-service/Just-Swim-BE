import { Test, TestingModule } from '@nestjs/testing';
import { NotificationStatsController } from './notification-stats.controller';
import { NotificationService } from './notification.service';
import { ResponseService } from 'src/common/response/response.service';
import { Response } from 'express';

class MockNotificationService {
  getUnreadCount = jest.fn();
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

describe('NotificationStatsController', () => {
  let controller: NotificationStatsController;
  let notificationService: MockNotificationService;
  let responseService: MockResponseService;

  const mockUser = {
    userId: 1,
    userType: 'customer',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationStatsController],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ResponseService,
          useClass: MockResponseService,
        },
      ],
    }).compile();

    controller = module.get<NotificationStatsController>(
      NotificationStatsController,
    );
    notificationService =
      module.get<MockNotificationService>(NotificationService);
    responseService = module.get<MockResponseService>(ResponseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
});
