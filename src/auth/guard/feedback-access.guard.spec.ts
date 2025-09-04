import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { FeedbackAccessGuard } from './feedback-access.guard';
import { FeedbackService } from 'src/feedback/feedback.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('FeedbackAccessGuard', () => {
  let guard: FeedbackAccessGuard;
  let feedbackService: FeedbackService;
  let reflector: Reflector;

  const mockRequest = {
    user: { userId: 1 },
    params: { feedbackId: '1' },
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackAccessGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: FeedbackService,
          useValue: {
            checkFeedbackAccess: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<FeedbackAccessGuard>(FeedbackAccessGuard);
    feedbackService = module.get<FeedbackService>(FeedbackService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      // Reset mock request for each test
      mockRequest.user = { userId: 1 };
      mockRequest.params = { feedbackId: '1' };
    });

    it('should return true when user has access to feedback', async () => {
      (feedbackService.checkFeedbackAccess as jest.Mock).mockResolvedValue(
        true,
      );

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(feedbackService.checkFeedbackAccess).toHaveBeenCalledWith(1, 1);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      mockRequest.user = null;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '인증된 사용자만 접근할 수 있습니다.',
      );
    });

    it('should throw NotFoundException when feedbackId is invalid', async () => {
      mockRequest.params.feedbackId = 'invalid';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '유효하지 않은 피드백 ID입니다.',
      );
    });

    it('should throw NotFoundException when feedbackId is missing', async () => {
      mockRequest.params.feedbackId = undefined;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      (feedbackService.checkFeedbackAccess as jest.Mock).mockResolvedValue(
        false,
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '피드백 접근 권한이 없습니다.',
      );
    });

    it('should throw ForbiddenException when checkFeedbackAccess throws an error', async () => {
      (feedbackService.checkFeedbackAccess as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '피드백 접근 권한을 확인할 수 없습니다.',
      );
    });

    it('should rethrow ForbiddenException from checkFeedbackAccess', async () => {
      const originalError = new ForbiddenException('Original error');
      (feedbackService.checkFeedbackAccess as jest.Mock).mockRejectedValue(
        originalError,
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        originalError,
      );
    });

    it('should rethrow NotFoundException from checkFeedbackAccess', async () => {
      const originalError = new NotFoundException('Original error');
      (feedbackService.checkFeedbackAccess as jest.Mock).mockRejectedValue(
        originalError,
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        originalError,
      );
    });
  });
});

