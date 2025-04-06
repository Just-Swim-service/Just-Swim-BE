import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackTargetRepository } from './feedback-target.repository';
import { FeedbackType } from './enum/feedback-type.enum';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
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
            deleteImageFromS3: jest.fn(),
            uploadQRCodeToS3: jest.fn(),
            getPresignedUrl: jest.fn(),
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
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    feedbackRepository = module.get<FeedbackRepository>(FeedbackRepository);
    feedbackTargetRepository = module.get<FeedbackTargetRepository>(
      FeedbackTargetRepository,
    );
    awsService = module.get<AwsService>(AwsService);
    imageService = module.get<ImageService>(ImageService);
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
          feedback: mockFeedback.feedbackId,
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
      const mockFeedback = {
        feedbackId: 1,
        feedbackContent: 'Great lecture!',
        feedbackDate: '2024-09-05',
        feedbackType: 'positive',
        feedbackLink: 'http://example.com/feedback/1',
        feedbackCreatedAt: '2024-09-05T08:56:43.366Z',
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
        mockUser.userId,
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
    it('이미지 저장을 위해 FE에게 presigned url을 return', async () => {
      const userId = 1;
      const feedbackImageDto = {
        files: ['test-image.jpg', 'example-image.png'],
      };

      const mockPresignedUrls = [
        'https://s3.amazonaws.com/bucket/test-image-1.jpg',
        'https://s3.amazonaws.com/bucket/test-image-2.png',
      ];
      jest
        .spyOn(awsService, 'getPresignedUrl')
        .mockResolvedValueOnce(mockPresignedUrls[0])
        .mockResolvedValueOnce(mockPresignedUrls[1]);

      const result = await service.generateFeedbackPresignedUrls(
        userId,
        feedbackImageDto,
      );

      expect(awsService.getPresignedUrl).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            presignedUrl: mockPresignedUrls[0],
            fileName: expect.stringMatching(
              `feedback/${userId}/\\d+-test-image.jpg`,
            ),
          },
          {
            presignedUrl: mockPresignedUrls[1],
            fileName: expect.stringMatching(
              `feedback/${userId}/\\d+-example-image.png`,
            ),
          },
        ]),
      );
    });
  });

  describe('createFeedback', () => {
    it('새로운 feedback을 instructor가 생성', async () => {
      const userId = 1;
      const feedbackDto = {
        feedbackType: FeedbackType.Group,
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackDate: '2024.04.22',
        feedbackLink: 'URL',
        feedbackTarget: [
          { lectureId: 1, userIds: [2, 3] },
          { lectureId: 2, userIds: [4, 5, 13] },
        ],
        feedbackImage: ['https://example.com/test.jpg'],
      };

      const result = await service.createFeedback(userId, feedbackDto);

      expect(feedbackRepository.createFeedback).toHaveBeenCalledWith(
        userId,
        feedbackDto,
        JSON.stringify(feedbackDto.feedbackTarget),
        JSON.stringify([{ filePath: feedbackDto.feedbackImage[0] }]),
      );
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('updateFeedback', () => {
    it('feedbackId에 해당하는 feedback을 수정', async () => {
      const editFeedbackDto: EditFeedbackDto = {
        feedbackType: FeedbackType.Personal,
        feedbackContent: 'Updated feedback content',
        feedbackDate: '2024-04-23',
        feedbackLink: 'URL',
        feedbackTarget: [{ lectureId: 1, userIds: [2, 3] }],
        feedbackImage: ['https://example.com/updated.jpg'],
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
      expect(imageService.getImagesByFeedbackId).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
      );
      expect(awsService.deleteImageFromS3).toHaveBeenCalledWith(
        'feedback/1/1234567890-test.jpg',
      );
      expect(feedbackRepository.updateFeedback).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
        editFeedbackDto,
        JSON.stringify(editFeedbackDto.feedbackTarget),
        JSON.stringify([{ filePath: 'https://example.com/updated.jpg' }]),
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
});
