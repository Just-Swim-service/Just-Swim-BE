import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsRepository } from './statistics.repository';
import { UserBadge } from './entity/user-badge.entity';
import { UserLevel } from './entity/user-level.entity';
import { Member } from 'src/member/entity/member.entity';
import { FeedbackTarget } from 'src/feedback/entity/feedback-target.entity';
import { Community } from 'src/community/entity/community.entity';
import { CommunityComment } from 'src/community/entity/community-comment.entity';
import { Feedback } from 'src/feedback/entity/feedback.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Users } from 'src/users/entity/users.entity';
import { BadgeType } from './enum/badge-type.enum';

describe('StatisticsRepository', () => {
  let repository: StatisticsRepository;
  let userLevelRepository: Repository<UserLevel>;
  let userBadgeRepository: Repository<UserBadge>;
  let usersRepository: Repository<Users>;
  let memberRepository: Repository<Member>;
  let feedbackTargetRepository: Repository<FeedbackTarget>;
  let communityRepository: Repository<Community>;

  const mockUser = {
    userId: 1,
    name: '테스트유저',
    email: 'test@test.com',
  };

  const mockUserLevel = {
    userLevelId: 1,
    user: mockUser,
    level: 1,
    experience: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserBadge = {
    userBadgeId: 1,
    user: mockUser,
    badgeType: BadgeType.FIRST_CLASS,
    badgeDescription: '첫 강의에 등록했습니다',
    earnedAt: new Date(),
  };

  const createMockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn(),
      getRawOne: jest.fn(),
    })),
    query: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsRepository,
        {
          provide: getRepositoryToken(UserBadge),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(UserLevel),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Member),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(FeedbackTarget),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Community),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(CommunityComment),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Feedback),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Lecture),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Users),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<StatisticsRepository>(StatisticsRepository);
    userLevelRepository = module.get(getRepositoryToken(UserLevel));
    userBadgeRepository = module.get(getRepositoryToken(UserBadge));
    usersRepository = module.get(getRepositoryToken(Users));
    memberRepository = module.get(getRepositoryToken(Member));
    feedbackTargetRepository = module.get(getRepositoryToken(FeedbackTarget));
    communityRepository = module.get(getRepositoryToken(Community));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOrCreateUserLevel', () => {
    it('기존 사용자 레벨을 찾아 반환해야 함', async () => {
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        mockUserLevel,
      );

      const result = await repository.findOrCreateUserLevel(1);

      expect(result).toEqual(mockUserLevel);
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId: 1 } },
        relations: ['user'],
      });
      expect(userLevelRepository.create).not.toHaveBeenCalled();
    });

    it('사용자 레벨이 없으면 새로 생성해야 함', async () => {
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(null);
      (usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userLevelRepository.create as jest.Mock).mockReturnValue(mockUserLevel);
      (userLevelRepository.save as jest.Mock).mockResolvedValue(mockUserLevel);

      const result = await repository.findOrCreateUserLevel(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(userLevelRepository.create).toHaveBeenCalled();
      expect(userLevelRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUserLevel);
    });
  });

  describe('updateUserLevel', () => {
    it('사용자 레벨을 업데이트해야 함', async () => {
      const updatedLevel = {
        ...mockUserLevel,
        level: 5,
        experience: 450,
      } as any;
      (userLevelRepository.save as jest.Mock).mockResolvedValue(updatedLevel);

      const result = await repository.updateUserLevel(updatedLevel);

      expect(userLevelRepository.save).toHaveBeenCalledWith(updatedLevel);
      expect(result).toEqual(updatedLevel);
    });
  });

  describe('findUserBadges', () => {
    it('사용자의 배지 목록을 반환해야 함', async () => {
      const badges = [mockUserBadge];
      (userBadgeRepository.find as jest.Mock).mockResolvedValue(badges);

      const result = await repository.findUserBadges(1);

      expect(userBadgeRepository.find).toHaveBeenCalledWith({
        where: { user: { userId: 1 } },
        order: { earnedAt: 'DESC' },
      });
      expect(result).toEqual(badges);
    });

    it('배지가 없으면 빈 배열을 반환해야 함', async () => {
      (userBadgeRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findUserBadges(1);

      expect(result).toEqual([]);
    });
  });

  describe('addBadge', () => {
    it('새로운 배지를 추가해야 함', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userBadgeRepository.create as jest.Mock).mockReturnValue(mockUserBadge);
      (userBadgeRepository.save as jest.Mock).mockResolvedValue(mockUserBadge);

      const result = await repository.addBadge(
        1,
        'first_class',
        '첫 강의에 등록했습니다',
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(userBadgeRepository.create).toHaveBeenCalled();
      expect(userBadgeRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUserBadge);
    });
  });

  describe('hasBadge', () => {
    it('배지가 있으면 true를 반환해야 함', async () => {
      (userBadgeRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.hasBadge(1, 'first_class');

      expect(userBadgeRepository.count).toHaveBeenCalledWith({
        where: {
          user: { userId: 1 },
          badgeType: 'first_class',
        },
      });
      expect(result).toBe(true);
    });

    it('배지가 없으면 false를 반환해야 함', async () => {
      (userBadgeRepository.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.hasBadge(1, 'first_class');

      expect(result).toBe(false);
    });
  });

  describe('getStudentFeedbackStats', () => {
    it('수강생의 피드백 통계를 조회해야 함', async () => {
      const mockFeedbackTargets = [
        { feedbackTargetId: 1, user: mockUser },
        { feedbackTargetId: 2, user: mockUser },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockFeedbackTargets),
      };

      (
        feedbackTargetRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue(mockQueryBuilder);

      const result = await repository.getStudentFeedbackStats(1);

      expect(feedbackTargetRepository.createQueryBuilder).toHaveBeenCalledWith(
        'ft',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'ft.userId = :userId',
        {
          userId: 1,
        },
      );
      expect(result).toEqual(mockFeedbackTargets);
    });

    it('기간을 지정하여 피드백 통계를 조회할 수 있어야 함', async () => {
      const startDate = new Date('2024-01-01');
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      (
        feedbackTargetRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue(mockQueryBuilder);

      await repository.getStudentFeedbackStats(1, startDate);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ft.feedbackTargetCreatedAt >= :startDate',
        { startDate },
      );
    });
  });

  describe('getStudentLectures', () => {
    it('수강생의 강의 목록을 조회해야 함', async () => {
      const mockLectures = [{ memberId: 1, lecture: { lectureId: 1 } }];

      (memberRepository.find as jest.Mock).mockResolvedValue(mockLectures);

      const result = await repository.getStudentLectures(1);

      expect(memberRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockLectures);
    });
  });

  describe('getActiveStudentsRanking', () => {
    it('활동적인 수강생 랭킹을 조회해야 함', async () => {
      const mockRankings = [
        {
          userId: '1',
          name: '김학생',
          score: '150',
          level: '10',
        },
      ];

      (usersRepository.query as jest.Mock).mockResolvedValue(mockRankings);

      const result = await repository.getActiveStudentsRanking(50, 30);

      expect(usersRepository.query).toHaveBeenCalled();
      expect(result).toEqual(mockRankings);
    });
  });

  describe('getPopularInstructorsRanking', () => {
    it('인기 강사 랭킹을 조회해야 함', async () => {
      const mockRankings = [
        {
          userId: '1',
          name: '김강사',
          score: '500',
          level: '15',
        },
      ];

      (usersRepository.query as jest.Mock).mockResolvedValue(mockRankings);

      const result = await repository.getPopularInstructorsRanking(50, 30);

      expect(usersRepository.query).toHaveBeenCalled();
      expect(result).toEqual(mockRankings);
    });
  });
});
