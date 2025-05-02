import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackTargetRepository } from './feedback-target.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedbackTarget } from './entity/feedback-target.entity';
import { Repository } from 'typeorm';

describe('FeedbackTargetRepository', () => {
  let feedbackTargetRepository: FeedbackTargetRepository;
  let repo: jest.Mocked<Repository<FeedbackTarget>>;

  const mockRepo = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackTargetRepository,
        {
          provide: getRepositoryToken(FeedbackTarget),
          useValue: mockRepo,
        },
      ],
    }).compile();

    feedbackTargetRepository = module.get<FeedbackTargetRepository>(
      FeedbackTargetRepository,
    );
    repo = module.get(getRepositoryToken(FeedbackTarget));
  });

  it('should get feedback targets by feedbackId', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([
      {
        memberId: 1,
        lectureId: 10,
        lectureTitle: 'Test Lecture',
        memberUserId: 1,
        memberName: '홍길동',
        memberProfileImage: 'img.jpg',
      },
    ]);

    const mockQB: any = {
      leftJoinAndSelect: () => mockQB,
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      distinct: () => mockQB,
      getRawMany: mockGetRawMany,
    };

    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result =
      await feedbackTargetRepository.getFeedbackTargetByFeedbackId(1);

    expect(result).toEqual([
      {
        memberId: 1,
        lectureId: 10,
        lectureTitle: 'Test Lecture',
        memberUserId: 1,
        memberName: '홍길동',
        memberProfileImage: 'img.jpg',
      },
    ]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });
});
