import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackRepository } from './feedback.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { EditFeedbackDto } from './dto/edit-feedback.dto';
import { FeedbackType } from './enum/feedback-type.enum';

describe('FeedbackRepository', () => {
  let feedbackRepository: FeedbackRepository;
  let repo: jest.Mocked<Repository<Feedback>>;

  const mockRepo = {
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackRepository,
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockRepo,
        },
      ],
    }).compile();

    feedbackRepository = module.get<FeedbackRepository>(FeedbackRepository);
    repo = module.get(getRepositoryToken(Feedback));
  });

  it('should get all feedback by instructor', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ feedbackId: 1 }]);
    const mockQB: any = {
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      andWhere: () => mockQB,
      groupBy: () => mockQB,
      orderBy: () => mockQB,
      addOrderBy: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await feedbackRepository.getAllFeedbackByInstructor(1);
    expect(result).toEqual([{ feedbackId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });

  it('should get all feedback by customer', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ feedbackId: 1 }]);
    const mockQB: any = {
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      andWhere: () => mockQB,
      orderBy: () => mockQB,
      addOrderBy: () => mockQB,
      groupBy: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await feedbackRepository.getAllFeedbackByCustomer(1);
    expect(result).toEqual([{ feedbackId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });

  it('should get feedback detail by PK', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ feedbackId: 1 }]);
    const mockQB: any = {
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      andWhere: () => mockQB,
      orderBy: () => mockQB,
      addOrderBy: () => mockQB,
      groupBy: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await feedbackRepository.getFeedbackByPk(1);
    expect(result).toEqual([{ feedbackId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });

  it('should create feedback via stored procedure', async () => {
    repo.query.mockResolvedValue([[{ feedbackId: 1 }]]);

    const feedbackImage = [
      {
        filePath: 'https://example.com/image1.png',
        fileType: 'image',
        fileName: 'image1.png',
        fileSize: 123456,
        duration: null,
        thumbnailPath: null,
      },
    ];

    const dto: CreateFeedbackDto = {
      feedbackType: FeedbackType.Group,
      feedbackDate: '2024.04.22',
      feedbackLink: 'https://youtube.com',
      feedbackContent: '내용',
      feedbackTarget: [{ lectureId: 1, userIds: [1, 2] }],
      feedbackImage,
    };

    const result = await feedbackRepository.createFeedback(
      1,
      dto,
      JSON.stringify(dto.feedbackTarget),
      JSON.stringify(dto.feedbackImage),
    );

    expect(result).toEqual({ feedbackId: 1 });
    expect(repo.query).toHaveBeenCalledWith(
      'CALL CREATE_FEEDBACK(?, ?, ?, ?, ?, ?, ?)',
      [
        1,
        dto.feedbackType,
        dto.feedbackContent,
        dto.feedbackDate,
        dto.feedbackLink,
        JSON.stringify(dto.feedbackTarget),
        JSON.stringify(dto.feedbackImage),
      ],
    );
  });

  it('should update feedback via stored procedure', async () => {
    repo.query.mockResolvedValue([]);

    const dto: EditFeedbackDto = {
      feedbackType: FeedbackType.Group,
      feedbackDate: '2024.05.01',
      feedbackLink: 'https://youtube.com',
      feedbackContent: '수정된 내용',
      feedbackTarget: [{ lectureId: 2, userIds: [3] }],
      feedbackImage: ['img2.jpg'],
    };

    await feedbackRepository.updateFeedback(
      1,
      dto,
      JSON.stringify(dto.feedbackTarget),
      JSON.stringify(dto.feedbackImage),
    );

    expect(repo.query).toHaveBeenCalledWith(
      'CALL UPDATE_FEEDBACK(?, ?, ?, ?, ?, ?, ?)',
      [
        1,
        dto.feedbackType,
        dto.feedbackContent,
        dto.feedbackDate,
        dto.feedbackLink,
        JSON.stringify(dto.feedbackTarget),
        JSON.stringify(dto.feedbackImage),
      ],
    );
  });

  it('should soft delete feedback via stored procedure', async () => {
    repo.query.mockResolvedValue([]);

    await feedbackRepository.softDeleteFeedback(1);
    expect(repo.query).toHaveBeenCalledWith('CALL SOFT_DELETE_FEEDBACK(?)', [
      1,
    ]);
  });
});
