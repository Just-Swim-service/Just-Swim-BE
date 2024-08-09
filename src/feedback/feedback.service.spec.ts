import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entity/feedback.entity';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackTargetRepository } from './feedbackTarget.repository';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { FeedbackType } from './enum/feedbackType.enum';
import { MockUsersRepository } from 'src/users/users.service.spec';
import { MockLectureRepository } from 'src/lecture/lecture.service.spec';
import { AwsService } from 'src/common/aws/aws.service';
import { ImageService } from 'src/image/image.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EditFeedbackDto } from './dto/editFeedback.dto';

const mockUser = new MockUsersRepository().mockUser;

export class MockFeedbackRepository {
  readonly mockFeedback: Feedback = {
    feedbackId: 1,
    user: mockUser,
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
}

const mockFeedback = new MockFeedbackRepository().mockFeedback;
const mockLecture = new MockLectureRepository().mockLecture;

export class MockFeedbackTargetRepository {
  readonly mockFeedbackTarget: FeedbackTarget = {
    feedbackTargetId: 1,
    feedback: mockFeedback,
    user: mockUser,
    lecture: mockLecture,
    feedbackTargetCreatedAt: new Date(),
    feedbackTargetUpdatedAt: new Date(),
  };
}

describe('FeedbackService', () => {
  let service: FeedbackService;
  let feedbackRepository: FeedbackRepository;
  let feedbackTargetRepository: FeedbackTargetRepository;
  let awsService: AwsService;
  let imageService: ImageService;

  const mockFeedback = new MockFeedbackRepository().mockFeedback;
  const mockFeedbackTarget = new MockFeedbackTargetRepository()
    .mockFeedbackTarget;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: ImageService,
          useValue: {
            createImage: jest.fn(),
            getImagesByFeedbackId: jest.fn(),
            deleteImagesByFeedbackId: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
        {
          provide: AwsService,
          useValue: {
            uploadImageToS3: jest.fn(),
            deleteImageFromS3: jest.fn(),
            uploadQRCodeToS3: jest.fn(),
          },
        },
        {
          provide: FeedbackRepository,
          useValue: {
            getAllFeedbackByInstructor: jest
              .fn()
              .mockResolvedValue([mockFeedback]),
            getAllFeedbackByCustomer: jest
              .fn()
              .mockResolvedValue([mockFeedback]),
            getFeedbackByPk: jest.fn().mockResolvedValue([mockFeedback]),
            createFeedback: jest.fn().mockResolvedValue(mockFeedback),
            updateFeedback: jest.fn().mockResolvedValue(undefined),
            softDeleteFeedback: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: FeedbackTargetRepository,
          useValue: {
            getFeedbackTargetByFeedbackId: jest
              .fn()
              .mockResolvedValue([mockFeedbackTarget]),
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

      expect(result).toEqual([mockFeedback]);
    });
  });

  describe('getAllFeedbackByCustomer', () => {
    it('customer가 받은 피드백 전부를 조회해서 return', async () => {
      const userId = 1;
      (
        feedbackRepository.getAllFeedbackByCustomer as jest.Mock
      ).mockResolvedValue([mockFeedback]);

      const result = await service.getAllFeedbackByCustomer(userId);

      expect(result).toEqual([mockFeedback]);
    });
  });

  describe('getFeedbackByPk', () => {
    it('feedbackId에 해당하는 feedback을 상세 조회해서 return', async () => {
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
        feedback: [mockFeedback],
        feedbackTargetList: [mockFeedbackTarget],
      });
    });

    it('feedback이 존재하지 않을 경우 NotFoundException 발생', async () => {
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.getFeedbackByPk(mockUser.userId, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('접근 권한이 없는 user일 경우 UnauthorizedException 발생', async () => {
      const anotherUser = { userId: 2 };
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue(
        mockFeedback,
      );
      (
        feedbackTargetRepository.getFeedbackTargetByFeedbackId as jest.Mock
      ).mockResolvedValue([mockFeedbackTarget]);

      await expect(
        service.getFeedbackByPk(anotherUser.userId, mockFeedback.feedbackId),
      ).rejects.toThrow(UnauthorizedException);
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
      };

      const files = [
        {
          mimetype: 'image/jpeg',
          originalname: 'test.jpg',
          buffer: Buffer.from('test'),
        },
      ] as unknown as Express.Multer.File[];

      const fileUrl = 's3://bucket/feedback/1/1234567890-test.jpg';
      (awsService.uploadImageToS3 as jest.Mock).mockResolvedValue(fileUrl);
      (feedbackRepository.createFeedback as jest.Mock).mockResolvedValue(
        mockFeedback,
      );

      const result = await service.createFeedback(userId, feedbackDto, files);

      expect(awsService.uploadImageToS3).toHaveBeenCalledWith(
        expect.any(String),
        files[0],
        'jpeg',
      );
      expect(feedbackRepository.createFeedback).toHaveBeenCalledWith(
        userId,
        feedbackDto,
        JSON.stringify(feedbackDto.feedbackTarget),
        JSON.stringify([{ filePath: fileUrl }]),
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
      };
      const files = [
        {
          mimetype: 'image/jpeg',
          originalname: 'test-update.jpg',
          buffer: Buffer.from('test-update'),
        },
      ] as unknown as Express.Multer.File[];
      const fileUrl = 's3://bucket/feedback/1/1234567890-test-update.jpg';
      (awsService.uploadImageToS3 as jest.Mock).mockResolvedValue(fileUrl);
      (awsService.deleteImageFromS3 as jest.Mock).mockResolvedValue(undefined);
      (imageService.getImagesByFeedbackId as jest.Mock).mockResolvedValue([
        { imagePath: 'feedback/1/1234567890-test.jpg' },
      ]);
      (feedbackRepository.updateFeedback as jest.Mock).mockResolvedValue(
        undefined,
      );
      (feedbackRepository.getFeedbackByPk as jest.Mock).mockResolvedValue([
        mockFeedback,
      ]);

      await service.updateFeedback(
        mockUser.userId,
        mockFeedback.feedbackId,
        editFeedbackDto,
        files,
      );
      expect(imageService.getImagesByFeedbackId).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
      );
      expect(awsService.deleteImageFromS3).toHaveBeenCalledWith(
        '1/1234567890-test.jpg',
      );
      expect(awsService.uploadImageToS3).toHaveBeenCalledWith(
        expect.any(String),
        files[0],
        'jpeg',
      );
      expect(feedbackRepository.updateFeedback).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
        editFeedbackDto,
        JSON.stringify(editFeedbackDto.feedbackTarget),
        JSON.stringify([{ filePath: fileUrl }]),
      );
    });
  });

  describe('softDeleteFeedback', () => {
    it('feedbackId에 해당하는 feedback softDelete', async () => {
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
        '1/1234567890-test.jpg',
      );
      expect(feedbackRepository.softDeleteFeedback).toHaveBeenCalledWith(
        mockFeedback.feedbackId,
      );
    });
  });
});
