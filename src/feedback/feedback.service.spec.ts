import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entity/feedback.entity';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackTargetRepository } from './feedbackTarget.repository';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { DataSource } from 'typeorm';

export class MockFeedbackRepository {
  readonly mockFeedback: Feedback = {
    feedbackId: 1,
    userId: 1,
    feedbackType: 'personal',
    feedbackContent:
      '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
    feedbackFile: 'file1',
    feedbackLink: 'URL',
    feedbackDate: '2024.04.22',
    feedbackTargetList: '2:2,3',
    feedbackCreatedAt: new Date(),
    feedbackUpdatedAt: new Date(),
    feedbackDeletedAt: null,
    feedbackTarget: [],
  };
}

export class MockFeedbackTargetRepository {
  readonly mockFeedbackTarget: FeedbackTarget = {
    feedbackTargetId: 1,
    feedbackId: 1,
    userId: 2,
    lectureId: 1,
    feedbackTargetCreatedAt: new Date(),
    feedbackTargetUpdatedAt: new Date(),
  };
}

class MockDataSource {
  createQueryRunner = jest.fn(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  }));
}

describe('FeedbackService', () => {
  let service: FeedbackService;
  let feedbackRepository: FeedbackRepository;
  let feedbackTargetRepository: FeedbackTargetRepository;
  let dataSource: DataSource;

  const mockFeedback = new MockFeedbackRepository().mockFeedback;
  const mockFeedbackTarget = new MockFeedbackTargetRepository()
    .mockFeedbackTarget;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: FeedbackRepository,
          useValue: {
            getAllFeedbackByInstructor: jest
              .fn()
              .mockResolvedValue(mockFeedback),
            getAllFeedbackByCustomer: jest.fn().mockRejectedValue(mockFeedback),
            getFeedbackByPk: jest.fn().mockResolvedValue(mockFeedback),
            createFeedback: jest.fn().mockResolvedValue(mockFeedback),
            updateFeedback: jest.fn().mockResolvedValue(mockFeedback),
            softDeleteFeedback: jest.fn().mockResolvedValue(mockFeedback),
          },
        },
        {
          provide: FeedbackTargetRepository,
          useValue: {
            getFeedbackTargetByFeedbackId: jest
              .fn()
              .mockRejectedValue(mockFeedbackTarget),
            createFeedbackTarget: jest
              .fn()
              .mockResolvedValue(mockFeedbackTarget),
            updateFeedbackTarget: jest
              .fn()
              .mockResolvedValue(mockFeedbackTarget),
            deleteFeedbackTarget: jest
              .fn()
              .mockResolvedValue(mockFeedbackTarget),
          },
        },
        { provide: DataSource, useClass: MockDataSource },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    feedbackRepository = module.get<FeedbackRepository>(FeedbackRepository);
    feedbackTargetRepository = module.get<FeedbackTargetRepository>(
      FeedbackTargetRepository,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFeedbackByInstructor', () => {
    it('강사가 제공한 피드백 전부를 조회해서 return', async () => {
      const userId = 1;
      (
        feedbackRepository.getAllFeedbackByInstructor as jest.Mock
      ).mockResolvedValue(mockFeedback);

      const result = await service.getAllFeedbackByInstructor(userId);

      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getAllFeedbackByCustomer', () => {
    it('customer가 받은 피드백 전부를 조회해서 return', async () => {
      const userId = 1;
      (
        feedbackRepository.getAllFeedbackByCustomer as jest.Mock
      ).mockResolvedValue(mockFeedback);

      const result = await service.getAllFeedbackByCustomer(userId);

      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getFeedbackByPk', () => {
    it('feedbackId에 해당하는 feedback을 상세 조회해서 return', async () => {
      const feedbackId = 1;
      const userId = 1;

      jest
        .spyOn(feedbackRepository, 'getFeedbackByPk')
        .mockResolvedValue(mockFeedback);
      jest
        .spyOn(feedbackTargetRepository, 'getFeedbackTargetByFeedbackId')
        .mockResolvedValue([mockFeedbackTarget]);

      const result = await service.getFeedbackByPk(userId, feedbackId);

      expect(result).toEqual({
        feedback: mockFeedback,
        feedbackTargetList: [mockFeedbackTarget],
      });
    });
  });

  describe('createFeedback', () => {
    it('새로운 feedback을 instructor가 생성', async () => {
      const userId = 1;
      const feedbackDto = {
        feedbackType: 'personal',
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackDate: '2024.04.22',
        feedbackFile: 'file1',
        feedbackLink: 'URL',
        feedbackTarget: '1:1,2/2:3,4',
      };
      const feedback: Feedback = {
        userId,
        feedbackId: 2,
        feedbackType: feedbackDto.feedbackType,
        feedbackContent: feedbackDto.feedbackContent,
        feedbackDate: feedbackDto.feedbackDate,
        feedbackFile: feedbackDto.feedbackFile,
        feedbackLink: feedbackDto.feedbackLink,
        feedbackTargetList: feedbackDto.feedbackTarget,
        feedbackCreatedAt: new Date(),
        feedbackUpdatedAt: new Date(),
        feedbackDeletedAt: null,
        feedbackTarget: [],
      };
      (feedbackRepository.createFeedback as jest.Mock).mockResolvedValue(
        feedback,
      );

      const result = await service.createFeedback(userId, feedbackDto);

      expect(result).toEqual(feedback);
    });
  });

  describe('createFeedbackTarget', () => {
    it('feedbackId에 해당하는 feedback을 대상에게 전달하기 위해 feedbackTarget 생성', async () => {
      const feedbackId = 1;

      // feedbackType이 personal
      const feedbackTargetPersonal = '1:2';
      jest
        .spyOn(feedbackTargetRepository, 'createFeedbackTarget')
        .mockResolvedValue(mockFeedbackTarget);

      await service.createFeedbackTarget(feedbackId, feedbackTargetPersonal);
      expect(
        feedbackTargetRepository.createFeedbackTarget,
      ).toHaveBeenCalledWith(feedbackId, 1, 2);

      // feedbackType이 group
      const feedbackTargetGroup = '2,3,4';
      const lectureId = 1;
      const expectedUserIds = [2, 3, 4];
      jest
        .spyOn(feedbackTargetRepository, 'createFeedbackTarget')
        .mockResolvedValue(mockFeedbackTarget);

      await service.createFeedbackTarget(
        feedbackId,
        `1:${feedbackTargetGroup}`,
      );

      expectedUserIds.forEach((userId) => {
        expect(
          feedbackTargetRepository.createFeedbackTarget,
        ).toHaveBeenCalledWith(feedbackId, lectureId, userId);
      });
    });
  });

  describe('updateFeedback', () => {
    it('feedbackId에 해당하는 feedback을 수정', async () => {
      const feedbackId = 1;
      const userId = 1;
      const editFeedbackDto = {
        feedbackId: '1',
        feedbackType: 'group',
        feedbackDate: '2024.04.22',
        feedbackTarget: '2:3,4,5',
        feedbackFile: 'file1',
        feedbackLink: 'URL',
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
      };

      jest
        .spyOn(feedbackRepository, 'getFeedbackByPk')
        .mockResolvedValue(mockFeedback);
      jest.spyOn(feedbackRepository, 'updateFeedback').mockResolvedValue(null);
      jest
        .spyOn(feedbackTargetRepository, 'deleteFeedbackTarget')
        .mockResolvedValue(null);
      jest
        .spyOn(feedbackTargetRepository, 'createFeedbackTarget')
        .mockResolvedValue(null);

      await service.updateFeedback(userId, feedbackId, editFeedbackDto);

      expect(feedbackRepository.updateFeedback).toHaveBeenCalledWith(
        feedbackId,
        editFeedbackDto,
      );
    });
  });

  describe('updateFeedbackTarget', () => {
    it('feedbackId에 해당하는 feedbackTarget 수정', async () => {
      const feedbackId = 1;
      const feedbackTargetGroup = '1:2,3,4';
      const expectedUserIds = [2, 3, 4];

      jest
        .spyOn(feedbackTargetRepository, 'deleteFeedbackTarget')
        .mockResolvedValue(null);
      jest
        .spyOn(feedbackTargetRepository, 'createFeedbackTarget')
        .mockResolvedValue(null);

      await service.updateFeedbackTarget(feedbackId, feedbackTargetGroup);

      expect(
        feedbackTargetRepository.deleteFeedbackTarget,
      ).toHaveBeenCalledWith(feedbackId);

      expectedUserIds.forEach((userId) => {
        expect(
          feedbackTargetRepository.createFeedbackTarget,
        ).toHaveBeenCalledWith(feedbackId, 1, userId);
      });
    });
  });

  describe('softDeleteFeedback', () => {
    it('feedbackId에 해당하는 feedback softDelete', async () => {
      const feedbackId = 1;
      const userId = 1;
      await service.softDeleteFeedback(userId, feedbackId);
      expect(feedbackRepository.softDeleteFeedback).toHaveBeenCalledWith(
        feedbackId,
      );
    });
  });

  describe('deleteFeedbackTarget', () => {
    it('feedbackId에 해당하는 feedbackTarget delete', async () => {
      const feedbackId = 1;
      await service.deleteFeedbackTarget(feedbackId);
      expect(
        feedbackTargetRepository.deleteFeedbackTarget,
      ).toHaveBeenCalledWith(feedbackId);
    });
  });
});
