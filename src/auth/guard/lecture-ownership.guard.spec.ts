import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { LectureOwnershipGuard } from './lecture-ownership.guard';
import { LectureService } from 'src/lecture/lecture.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('LectureOwnershipGuard', () => {
  let guard: LectureOwnershipGuard;
  let lectureService: LectureService;
  let reflector: Reflector;

  const mockRequest = {
    user: { userId: 1 },
    params: { lectureId: '1' },
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
        LectureOwnershipGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: LectureService,
          useValue: {
            checkLectureAccess: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<LectureOwnershipGuard>(LectureOwnershipGuard);
    lectureService = module.get<LectureService>(LectureService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      // Reset mock request for each test
      mockRequest.user = { userId: 1 };
      mockRequest.params = { lectureId: '1' };
    });

    it('should return true when user has access to lecture', async () => {
      (lectureService.checkLectureAccess as jest.Mock).mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(lectureService.checkLectureAccess).toHaveBeenCalledWith(1, 1);
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

    it('should throw NotFoundException when lectureId is invalid', async () => {
      mockRequest.params.lectureId = 'invalid';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '유효하지 않은 강의 ID입니다.',
      );
    });

    it('should throw NotFoundException when lectureId is missing', async () => {
      mockRequest.params.lectureId = undefined;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      (lectureService.checkLectureAccess as jest.Mock).mockResolvedValue(false);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '강의 접근 권한이 없습니다.',
      );
    });

    it('should throw ForbiddenException when checkLectureAccess throws an error', async () => {
      (lectureService.checkLectureAccess as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        '강의 접근 권한을 확인할 수 없습니다.',
      );
    });

    it('should rethrow ForbiddenException from checkLectureAccess', async () => {
      const originalError = new ForbiddenException('Original error');
      (lectureService.checkLectureAccess as jest.Mock).mockRejectedValue(
        originalError,
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        originalError,
      );
    });

    it('should rethrow NotFoundException from checkLectureAccess', async () => {
      const originalError = new NotFoundException('Original error');
      (lectureService.checkLectureAccess as jest.Mock).mockRejectedValue(
        originalError,
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        originalError,
      );
    });
  });
});
