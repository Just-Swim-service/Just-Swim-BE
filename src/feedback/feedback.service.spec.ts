import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackTargetRepository } from './feedback-target.repository';
import { FeedbackType } from './enum/feedback-type.enum';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EditFeedbackDto } from './dto/edit-feedback.dto';
import {
  mockFeedback,
  MockFeedbackRepository,
} from 'src/common/mocks/mock-feedback.repository';
import { MockFeedbackTargetRepository } from 'src/common/mocks/mock-feedback-target.repository';
import { mockUser } from 'src/common/mocks/mock-user.repository';
import { MockImageRepository } from 'src/common/mocks/mock-image.repository';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let feedbackRepository: FeedbackRepository;
  let feedbackTargetRepository: FeedbackTargetRepository;
  let awsService: AwsService;
  let imageService: ImageService;
  let usersService: UsersService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: ImageService,
          useValue: MockImageRepository,
        },
        {
          provide: AwsService,
          useValue: {
            uploadImageToS3: jest.fn(),
            deleteFileFromS3: jest.fn(),
            deleteImageFromS3: jest.fn(),
            uploadQRCodeToS3: jest.fn(),
            getPresignedUrl: jest.fn(),
            getContentType: jest.fn(),
          },
        },
        {
          provide: FeedbackRepository,
          useValue: MockFeedbackRepository,
        },
        {
          provide: FeedbackTargetRepository,
          useValue: MockFeedbackTargetRepository,
        },
        {
          provide: UsersService,
          useValue: {
            findUserByPk: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createFeedbackNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    feedbackRepository = module.get<FeedbackRepository>(FeedbackRepository);
    feedbackTargetRepository = module.get<FeedbackTargetRepository>(
      FeedbackTargetRepository,
    );
    awsService = module.get<AwsService>(AwsService);
    imageService = module.get<ImageService>(ImageService);
    usersService = module.get<UsersService>(UsersService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFeedbackByInstructor', () => {
    it('강사가 제공한 피드백 전부를 조회해서 return', async () => {
      const userId = 1;
      (
        feedbackRepository.getAllFeedbackByInstructor as jest.Mock
      ).mockResolvedValue([mockFeedback]);

      const result = await service.getAllFeedbackByInstructor(userId);

      expect(result).toEqual([
        expect.objectContaining({
          feedbackId: mockFeedback.feedbackId,
          feedbackType: mockFeedback.feedbackType,
          feedbackDate: mockFeedback.feedbackDate,
          feedbackContent: mockFeedback.feedbackContent,
          lectureTitle: undefined,
          members: [],
        }),
      ]);
    });
  });

  describe('getAllFeedbackByCustomer', () => {
    it('customer가 받은 피드백 전부를 조회해서 return', async () => {
      const userId = 1;
      (
        feedbackRepository.getAllFeedbackByCustomer as jest.Mock
      ).mockResolvedValue([mockFeedback]);

      const result = await service.getAllFeedbackByCustomer(userId);

      expect(result).toEqual([
        expect.objectContaining({
          feedbackId: mockFeedback.feedbackId,
          lectureTitle: undefined,
          feedbackContent: mockFeedback.feedbackContent,
          feedbackDate: mockFeedback.feedbackDate,
          feedbackType: mockFeedback.feedbackType,
          instructor: {
            instructorName: undefined,
            instructorProfileImage: undefined,
          },
        }),
      ]);
    });
  });

  describe('getFeedbackByPk', () => {
    it('feedbackId에 해당하는 feedback을 상세 조회해서 return', async () => {
      const mockInstructorUser = { ...mockUser, userType: 'instructor' };
      const mockFeedback = {
        feedbackId: 1,
        feedbackContent: 'Great lecture!',
        feedbackDate: '2024-09-05',
        feedbackType: 'positive',
        feedbackLink: 'http://example.com/feedback/1',
        feedbackCreatedAt: '2024-09-05T08:56:43.366Z',
        lectureTitle: '새벽 1반',
        instructorUserId: 1,
        instructorName: 'John Doe',
        instructorProfileImage: 'http://example.com/instructor.jpg',
        images: [],
      };

      const mockFeedbackTarget = {
        feedbackTargetId: 1,
        targetType: 'lecture',
        targetId: 1,
        targetTitle: 'Advanced Programming',
        targetDescription: 'A lecture on advanced programming techniques',
      };

      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue([
        mockFeedback,
      ]);
      (
        feedbackTargetRepository.getFeedbackTargetByFeedbackId as jest.Mock
      ).mockResolvedValue([mockFeedbackTarget]);

      const result = await service.getFeedbackByPk(
        mockInstructorUser.userId,
        mockFeedback.feedbackId,
      );
      expect(result).toEqual({
        feedback: [
          expect.objectContaining({
            feedbackId: mockFeedback.feedbackId,
            feedbackContent: mockFeedback.feedbackContent,
            feedbackDate: mockFeedback.feedbackDate,
            feedbackType: mockFeedback.feedbackType,
            feedbackLink: mockFeedback.feedbackLink,
            feedbackCreatedAt: mockFeedback.feedbackCreatedAt,
            lectureTitle: mockFeedback.lectureTitle,
            instructor: {
              instructorUserId: mockFeedback.instructorUserId,
              instructorName: mockFeedback.instructorName,
              instructorProfileImage: mockFeedback.instructorProfileImage,
            },
            images: mockFeedback.images,
          }),
        ],
        feedbackTargetList: [mockFeedbackTarget],
      });
    });

    it('feedback이 존재하지 않을 경우 NotFoundException 발생', async () => {
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.getFeedbackByPk(mockUser.userId, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateFeedbackPresignedUrls', () => {
    it('이미지/동영상 저장을 위해 FE에게 presigned url을 return', async () => {
      const userId = 1;
      const feedbackImageDto = {
        files: ['test-image.jpg', 'example-video.mp4'],
      };

      const mockPresignedUrls = [
        'https://s3.amazonaws.com/bucket/test-image-1.jpg',
        'https://s3.amazonaws.com/bucket/example-video-1.mp4',
      ];

      jest
        .spyOn(awsService, 'getPresignedUrl')
        .mockResolvedValueOnce({
          presignedUrl: mockPresignedUrls[0],
          contentType: 'image/jpeg',
        })
        .mockResolvedValueOnce({
          presignedUrl: mockPresignedUrls[1],
          contentType: 'video/mp4',
        });

      const result = await service.generateFeedbackPresignedUrls(
        userId,
        feedbackImageDto,
      );

      // getPresignedUrl은 2번 호출되어야 함
      expect(awsService.getPresignedUrl).toHaveBeenCalledTimes(2);

      // getContentType 호출은 제거했기 때문에 더 이상 필요 없음

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            presignedUrl: mockPresignedUrls[0],
            fileType: 'image',
            contentType: 'image/jpeg',
            fileName: expect.stringMatching(
              `feedback/${userId}/\\d+-test-image.jpg`,
            ),
          }),
          expect.objectContaining({
            presignedUrl: mockPresignedUrls[1],
            fileType: 'video',
            contentType: 'video/mp4',
            fileName: expect.stringMatching(
              `feedback/${userId}/\\d+-example-video.mp4`,
            ),
          }),
        ]),
      );
    });
  });

  describe('createFeedback', () => {
    it('새로운 feedback을 instructor가 생성', async () => {
      const userId = 1;
      const feedbackDto = {
        feedbackType: FeedbackType.Group,
        feedbackContent: '내용',
        feedbackDate: '2024.04.22',
        feedbackLink: 'URL',
        feedbackTarget: [{ lectureId: 1, userIds: [2, 3] }],
        feedbackImage: [
          {
            fileName: 'test.jpg',
            filePath: 'https://example.com/test.jpg',
            fileType: 'image' as const,
            fileSize: 123456,
            duration: null,
            thumbnailPath: null,
          },
        ],
      };

      const result = await service.createFeedback(userId, feedbackDto);

      const callArgs = (feedbackRepository.createFeedback as jest.Mock).mock
        .calls[0];

      expect(callArgs[0]).toBe(userId);
      expect(callArgs[1]).toEqual(feedbackDto);
      expect(JSON.parse(callArgs[2])).toEqual(feedbackDto.feedbackTarget);
      expect(JSON.parse(callArgs[3])).toEqual(feedbackDto.feedbackImage);

      expect(result).toEqual(mockFeedback);
    });

    it('피드백 생성 시 알림이 발송되어야 함', async () => {
      const userId = 1;
      const feedbackDto = {
        feedbackType: FeedbackType.Group,
        feedbackContent: '테스트 피드백 내용입니다.',
        feedbackDate: '2024.04.22',
        feedbackLink: 'URL',
        feedbackTarget: [{ lectureId: 1, userIds: [2, 3] }],
        feedbackImage: [],
      };

      const mockCreatedFeedback = {
        ...mockFeedback,
        feedbackId: 123,
      };

      (feedbackRepository.createFeedback as jest.Mock).mockResolvedValue(
        mockCreatedFeedback,
      );
      (
        notificationService.createFeedbackNotification as jest.Mock
      ).mockResolvedValue(undefined);

      await service.createFeedback(userId, feedbackDto);

      expect(
        notificationService.createFeedbackNotification,
      ).toHaveBeenCalledWith(
        userId,
        [2, 3], // targetUserIds
        123, // feedbackId
        '강의', // lectureTitle
        '테스트 피드백 내용입니다.', // feedbackContent
      );
    });

    it('알림 발송 실패 시에도 피드백 생성은 성공해야 함', async () => {
      const userId = 1;
      const feedbackDto = {
        feedbackType: FeedbackType.Group,
        feedbackContent: '테스트 피드백 내용입니다.',
        feedbackDate: '2024.04.22',
        feedbackLink: 'URL',
        feedbackTarget: [{ lectureId: 1, userIds: [2, 3] }],
        feedbackImage: [],
      };

      const mockCreatedFeedback = {
        ...mockFeedback,
        feedbackId: 123,
      };

      (feedbackRepository.createFeedback as jest.Mock).mockResolvedValue(
        mockCreatedFeedback,
      );
      (
        notificationService.createFeedbackNotification as jest.Mock
      ).mockRejectedValue(new Error('알림 발송 실패'));

      // console.error가 호출되는지 확인하기 위해 spy 설정
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.createFeedback(userId, feedbackDto);

      expect(result).toEqual(mockCreatedFeedback);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send feedback notification:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateFeedback', () => {
    it('feedbackId에 해당하는 feedback을 수정', async () => {
      const editFeedbackDto: EditFeedbackDto = {
        feedbackType: FeedbackType.Personal,
        feedbackContent: 'Updated feedback content',
        feedbackDate: '2024.04.23',
        feedbackLink: 'URL',
        feedbackTarget: [{ lectureId: 1, userIds: [2, 3] }],
        feedbackImage: [
          {
            fileName: 'test.jpg',
            filePath: 'https://example.com/test.jpg',
            fileType: 'image' as const,
            fileSize: 123456,
            duration: null,
            thumbnailPath: null,
          },
        ],
      };

      const mockFeedback = {
        feedbackId: 1,
        instructorUserId: 1,
        feedbackType: FeedbackType.Personal,
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackLink: 'URL',
        feedbackDate: '2024.04.22',
        feedbackCreatedAt: new Date(),
        feedbackUpdatedAt: new Date(),
        feedbackDeletedAt: null,
        feedbackTarget: [],
        image: [],
      };

      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue([
        mockFeedback,
      ]);
      (imageService.getImagesByFeedbackId as jest.Mock).mockResolvedValue([
        { imagePath: 's3://bucket/feedback/1/1234567890-test.jpg' },
      ]);

      await service.updateFeedback(
        mockUser.userId,
        mockFeedback.feedbackId,
        editFeedbackDto,
      );

      const [calledFeedbackId, calledDto, calledTargetJson, calledFilesJson] = (
        feedbackRepository.updateFeedback as jest.Mock
      ).mock.calls[0];

      expect(calledFeedbackId).toBe(mockFeedback.feedbackId);
      expect(calledDto).toEqual(editFeedbackDto);
      expect(JSON.parse(calledTargetJson)).toEqual(
        editFeedbackDto.feedbackTarget,
      );
      expect(JSON.parse(calledFilesJson)).toEqual(
        editFeedbackDto.feedbackImage,
      );
    });
  });

  describe('softDeleteFeedback', () => {
    it('feedbackId에 해당하는 feedback softDelete', async () => {
      const mockFeedback = {
        feedbackId: 1,
        instructorUserId: 1,
        feedbackType: FeedbackType.Personal,
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackLink: 'URL',
        feedbackDate: '2024.04.22',
        feedbackCreatedAt: new Date(),
        feedbackUpdatedAt: new Date(),
        feedbackDeletedAt: null,
        feedbackTarget: [],
        image: [],
      };

      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue([
        mockFeedback,
      ]);
      (imageService.getImagesByFeedbackId as jest.Mock).mockResolvedValue([
        { imagePath: 's3://bucket/feedback/1/1234567890-test.jpg' },
      ]);
      (awsService.deleteImageFromS3 as jest.Mock).mockResolvedValue(undefined);
      (feedbackRepository.softDeleteFeedback as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.softDeleteFeedback(
        mockUser.userId,
        mockFeedback.feedbackId,
      );
      expect(imageService.getImagesByFeedbackId).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
      );
      expect(awsService.deleteImageFromS3).toHaveBeenCalledWith(
        'feedback/1/1234567890-test.jpg',
      );
      expect(feedbackRepository.softDeleteFeedback).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
      );
    });
  });

  describe('checkFeedbackAccess', () => {
    it('강사가 자신이 작성한 피드백에 접근할 수 있어야 함', async () => {
      const userId = 1;
      const feedbackId = 1;
      const mockUser = { userId: 1, userType: 'instructor' };
      const mockFeedback = [{ instructorUserId: 1 }];

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(
        mockFeedback,
      );

      const result = await service.checkFeedbackAccess(userId, feedbackId);

      expect(result).toBe(true);
      expect(usersService.findUserByPk).toHaveBeenCalledWith(userId);
      expect(feedbackRepository.getFeedbackByPk).toHaveBeenCalledWith(
        feedbackId,
      );
    });

    it('강사가 다른 사람이 작성한 피드백에 접근할 수 없어야 함', async () => {
      const userId = 1;
      const feedbackId = 1;
      const mockUser = { userId: 1, userType: 'instructor' };
      const mockFeedback = [{ instructorUserId: 2 }];

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(
        mockFeedback,
      );

      const result = await service.checkFeedbackAccess(userId, feedbackId);

      expect(result).toBe(false);
    });

    it('수강생이 자신이 대상인 피드백에 접근할 수 있어야 함', async () => {
      const userId = 1;
      const feedbackId = 1;
      const mockUser = { userId: 1, userType: 'customer' };
      const mockFeedback = [{ instructorUserId: 2 }];
      const mockTargets = [{ memberUserId: 1 }, { memberUserId: 2 }];

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(
        mockFeedback,
      );
      (
        feedbackTargetRepository.getFeedbackTargetByFeedbackId as jest.Mock
      ).mockResolvedValue(mockTargets);

      const result = await service.checkFeedbackAccess(userId, feedbackId);

      expect(result).toBe(true);
      expect(
        feedbackTargetRepository.getFeedbackTargetByFeedbackId,
      ).toHaveBeenCalledWith(feedbackId);
    });

    it('수강생이 자신이 대상이 아닌 피드백에 접근할 수 없어야 함', async () => {
      const userId = 1;
      const feedbackId = 1;
      const mockUser = { userId: 1, userType: 'customer' };
      const mockFeedback = [{ instructor: { instructorUserId: 2 } }];
      const mockTargets = [{ memberUserId: 2 }, { memberUserId: 3 }];

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(
        mockFeedback,
      );
      (
        feedbackTargetRepository.getFeedbackTargetByFeedbackId as jest.Mock
      ).mockResolvedValue(mockTargets);

      const result = await service.checkFeedbackAccess(userId, feedbackId);

      expect(result).toBe(false);
    });

    it('사용자가 존재하지 않으면 false를 반환해야 함', async () => {
      const userId = 1;
      const feedbackId = 1;

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(null);

      const result = await service.checkFeedbackAccess(userId, feedbackId);

      expect(result).toBe(false);
    });

    it('피드백이 존재하지 않으면 false를 반환해야 함', async () => {
      const userId = 1;
      const feedbackId = 1;
      const mockUser = { userId: 1, userType: 'instructor' };

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue([]);

      const result = await service.checkFeedbackAccess(userId, feedbackId);

      expect(result).toBe(false);
    });
  });
});
