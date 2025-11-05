import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { StatisticsRepository } from './statistics.repository';
import { BadgeType } from './enum/badge-type.enum';
import { RankingType } from './dto/ranking.dto';
import { FeedbackType } from 'src/feedback/enum/feedback-type.enum';
import { CategoryType } from 'src/community/enum/category-type.enum';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let repository: StatisticsRepository;

  const mockUserLevel = {
    userLevelId: 1,
    user: { userId: 1 },
    level: 1,
    experience: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  };

  const mockUserBadge = {
    userBadgeId: 1,
    user: { userId: 1 },
    badgeType: BadgeType.FIRST_CLASS,
    badgeDescription: '첫 강의에 등록했습니다',
    earnedAt: new Date(),
  };

  const mockRepository = {
    findOrCreateUserLevel: jest.fn(),
    updateUserLevel: jest.fn(),
    findUserBadges: jest.fn(),
    addBadge: jest.fn(),
    hasBadge: jest.fn(),
    getStudentFeedbackStats: jest.fn(),
    getStudentLectures: jest.fn(),
    getStudentCommunityStats: jest.fn(),
    getInstructorLectures: jest.fn(),
    getInstructorFeedbackStats: jest.fn(),
    getInstructorCommunityStats: jest.fn(),
    getActiveStudentsRanking: jest.fn(),
    getPopularInstructorsRanking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: StatisticsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    repository = module.get<StatisticsRepository>(StatisticsRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserExperience', () => {
    it('사용자 경험치를 정상적으로 업데이트해야 함', async () => {
      const userId = 1;
      const expGain = 50;

      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
      });
      mockRepository.updateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        experience: 50,
      });

      await service.updateUserExperience(userId, expGain);

      expect(mockRepository.findOrCreateUserLevel).toHaveBeenCalledWith(userId);
      expect(mockRepository.updateUserLevel).toHaveBeenCalled();
    });

    it('경험치가 100 이상이면 레벨업 해야 함', async () => {
      const userId = 1;
      const expGain = 150;

      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
      });
      mockRepository.updateUserLevel.mockImplementation((userLevel) => {
        expect(userLevel.level).toBe(2);
        return Promise.resolve(userLevel);
      });

      await service.updateUserExperience(userId, expGain);

      expect(mockRepository.updateUserLevel).toHaveBeenCalled();
    });

    it('연속 활동 일수를 업데이트해야 함', async () => {
      const userId = 1;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: yesterday,
      });
      mockRepository.updateUserLevel.mockImplementation((userLevel) => {
        expect(userLevel.currentStreak).toBe(6);
        return Promise.resolve(userLevel);
      });

      await service.updateUserExperience(userId, 10);

      expect(mockRepository.updateUserLevel).toHaveBeenCalled();
    });

    it('활동이 끊기면 스트릭을 초기화해야 함', async () => {
      const userId = 1;
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: threeDaysAgo,
      });
      mockRepository.updateUserLevel.mockImplementation((userLevel) => {
        expect(userLevel.currentStreak).toBe(1);
        return Promise.resolve(userLevel);
      });

      await service.updateUserExperience(userId, 10);

      expect(mockRepository.updateUserLevel).toHaveBeenCalled();
    });
  });

  describe('checkAndAwardBadge', () => {
    it('배지가 없으면 새로 부여해야 함', async () => {
      const userId = 1;
      const badgeType = BadgeType.FIRST_CLASS;

      mockRepository.hasBadge.mockResolvedValue(false);
      mockRepository.addBadge.mockResolvedValue(mockUserBadge);

      await service.checkAndAwardBadge(userId, badgeType);

      expect(mockRepository.hasBadge).toHaveBeenCalledWith(userId, badgeType);
      expect(mockRepository.addBadge).toHaveBeenCalled();
    });

    it('이미 배지가 있으면 중복 부여하지 않아야 함', async () => {
      const userId = 1;
      const badgeType = BadgeType.FIRST_CLASS;

      mockRepository.hasBadge.mockResolvedValue(true);

      await service.checkAndAwardBadge(userId, badgeType);

      expect(mockRepository.hasBadge).toHaveBeenCalledWith(userId, badgeType);
      expect(mockRepository.addBadge).not.toHaveBeenCalled();
    });
  });

  describe('getStudentDashboard', () => {
    it('수강생 대시보드 데이터를 정상적으로 반환해야 함', async () => {
      const userId = 1;

      // Mock data
      const mockFeedbackTargets = [
        {
          feedback: {
            feedbackType: FeedbackType.Personal,
            feedbackCreatedAt: new Date('2024-01-15'),
          },
          feedbackTargetCreatedAt: new Date('2024-01-15'),
        },
        {
          feedback: {
            feedbackType: FeedbackType.Group,
            feedbackCreatedAt: new Date('2024-02-15'),
          },
          feedbackTargetCreatedAt: new Date('2024-02-15'),
        },
      ];

      const mockLectures = [
        {
          lecture: {
            lectureId: 1,
            lectureTitle: '자유형 초급',
            user: { name: '김강사' },
            lectureEndDate: null,
          },
          memberCreatedAt: new Date('2024-01-01'),
        },
      ];

      const mockCommunityStats = {
        posts: [
          {
            category: CategoryType.RECORD,
            likeCount: 10,
            bookmarks: [],
            workoutData: { distance: 1000, duration: 1800 },
          },
        ],
        comments: [{}, {}],
      };

      mockRepository.getStudentFeedbackStats.mockResolvedValue(
        mockFeedbackTargets,
      );
      mockRepository.getStudentLectures.mockResolvedValue(mockLectures);
      mockRepository.getStudentCommunityStats.mockResolvedValue(
        mockCommunityStats,
      );
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 5,
        experience: 450,
        currentStreak: 7,
        longestStreak: 15,
      });
      mockRepository.findUserBadges.mockResolvedValue([mockUserBadge]);

      const result = await service.getStudentDashboard(userId);

      expect(result).toBeDefined();
      expect(result.feedbackStats.totalFeedbacks).toBe(2);
      expect(result.feedbackStats.personalFeedbacks).toBe(1);
      expect(result.feedbackStats.groupFeedbacks).toBe(1);
      expect(result.lectureStats.totalLectures).toBe(1);
      expect(result.communityActivity.totalPosts).toBe(1);
      expect(result.communityActivity.totalComments).toBe(2);
      expect(result.levelInfo.currentLevel).toBe(5);
      expect(result.levelInfo.levelName).toBe('초보 수영러');
      expect(result.badges).toHaveLength(1);
    });

    it('운동 기록 통계를 정상적으로 계산해야 함', async () => {
      const userId = 1;

      const mockCommunityStats = {
        posts: [
          {
            category: CategoryType.RECORD,
            likeCount: 5,
            bookmarks: [],
            workoutData: { distance: 1000, duration: 1800 },
          },
          {
            category: CategoryType.RECORD,
            likeCount: 3,
            bookmarks: [],
            workoutData: { distance: 1500, duration: 2400 },
          },
        ],
        comments: [],
      };

      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue(
        mockCommunityStats,
      );
      mockRepository.findOrCreateUserLevel.mockResolvedValue(mockUserLevel);
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(userId);

      expect(result.communityActivity.workoutStats).toBeDefined();
      expect(result.communityActivity.workoutStats?.totalWorkouts).toBe(2);
      expect(result.communityActivity.workoutStats?.totalDistance).toBe(2500);
      expect(result.communityActivity.workoutStats?.totalDuration).toBe(4200);
    });
  });

  describe('getInstructorDashboard', () => {
    it('강사 대시보드 데이터를 정상적으로 반환해야 함', async () => {
      const userId = 1;

      const mockLectures = [
        {
          lectureId: 1,
          lectureTitle: '자유형 초급',
          lectureEndDate: null,
          lectureCreatedAt: new Date('2024-01-01'),
          member: [
            {
              user: { userId: 2, name: '김학생', profileImage: '' },
              memberNickname: '학생1',
              memberCreatedAt: new Date('2024-01-05'),
              memberDeletedAt: null,
            },
          ],
        },
      ];

      const mockFeedbacks = [
        {
          feedbackType: FeedbackType.Personal,
          feedbackCreatedAt: new Date('2024-01-15'),
        },
        {
          feedbackType: FeedbackType.Group,
          feedbackCreatedAt: new Date('2024-02-15'),
        },
      ];

      const mockCommunityPosts = [
        {
          category: CategoryType.TIP,
          title: '수영 팁',
          likeCount: 25,
          commentCount: 5,
        },
      ];

      mockRepository.getInstructorLectures.mockResolvedValue(mockLectures);
      mockRepository.getInstructorFeedbackStats.mockResolvedValue(
        mockFeedbacks,
      );
      mockRepository.getInstructorCommunityStats.mockResolvedValue(
        mockCommunityPosts,
      );
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);

      const result = await service.getInstructorDashboard(userId);

      expect(result).toBeDefined();
      expect(result.lectureStats.totalLectures).toBe(1);
      expect(result.lectureStats.totalStudents).toBe(1);
      expect(result.feedbackStats.totalFeedbacks).toBe(2);
      expect(result.communityStats.totalPosts).toBe(1);
      expect(result.communityStats.tipPosts).toBe(1);
    });

    it('인기 게시글을 정상적으로 필터링해야 함', async () => {
      const userId = 1;

      const mockCommunityPosts = [
        {
          communityId: 1,
          category: CategoryType.TIP,
          title: '인기글 1',
          likeCount: 50,
          commentCount: 10,
        },
        {
          communityId: 2,
          category: CategoryType.STORY,
          title: '인기글 2',
          likeCount: 30,
          commentCount: 8,
        },
        {
          communityId: 3,
          category: CategoryType.QUESTION,
          title: '비인기글',
          likeCount: 5,
          commentCount: 2,
        },
      ];

      mockRepository.getInstructorLectures.mockResolvedValue([]);
      mockRepository.getInstructorFeedbackStats.mockResolvedValue([]);
      mockRepository.getInstructorCommunityStats.mockResolvedValue(
        mockCommunityPosts,
      );

      const result = await service.getInstructorDashboard(userId);

      expect(result.communityStats.popularPosts).toHaveLength(2);
      expect(
        result.communityStats.popularPosts[0].likeCount,
      ).toBeGreaterThanOrEqual(10);
    });
  });

  describe('getRankings', () => {
    it('수강생 활동 랭킹을 정상적으로 반환해야 함', async () => {
      const mockRankings = [
        {
          userId: '1',
          name: '김학생',
          nickname: '열정',
          profileImage: '',
          level: '10',
          score: '150',
          feedbackCount: '10',
          postCount: '5',
          commentCount: '20',
          likeCount: '30',
        },
        {
          userId: '2',
          name: '이학생',
          nickname: '노력',
          profileImage: '',
          level: '8',
          score: '120',
          feedbackCount: '8',
          postCount: '4',
          commentCount: '15',
          likeCount: '20',
        },
      ];

      mockRepository.getActiveStudentsRanking.mockResolvedValue(mockRankings);

      const result = await service.getRankings(
        RankingType.STUDENT_ACTIVITY,
        30,
        1,
      );

      expect(result).toBeDefined();
      expect(result.rankings).toHaveLength(2);
      expect(result.rankings[0].rank).toBe(1);
      expect(result.rankings[1].rank).toBe(2);
      expect(result.myRanking).toBeDefined();
      expect(result.myRanking?.userId).toBe(1);
    });

    it('인기 강사 랭킹을 정상적으로 반환해야 함', async () => {
      const mockRankings = [
        {
          userId: '1',
          name: '김강사',
          nickname: '',
          profileImage: '',
          level: '15',
          score: '500',
          studentCount: '20',
          feedbackCount: '50',
          postCount: '10',
          likeCount: '100',
        },
      ];

      mockRepository.getPopularInstructorsRanking.mockResolvedValue(
        mockRankings,
      );

      const result = await service.getRankings(
        RankingType.INSTRUCTOR_POPULAR,
        30,
      );

      expect(result).toBeDefined();
      expect(result.rankings).toHaveLength(1);
      expect(result.rankings[0].details.studentCount).toBe(20);
    });

    it('내 순위가 없으면 undefined를 반환해야 함', async () => {
      const mockRankings = [
        {
          userId: '2',
          name: '김학생',
          nickname: '',
          profileImage: '',
          level: '10',
          score: '150',
          feedbackCount: '10',
          postCount: '5',
          commentCount: '20',
          likeCount: '30',
        },
      ];

      mockRepository.getActiveStudentsRanking.mockResolvedValue(mockRankings);

      const result = await service.getRankings(
        RankingType.STUDENT_ACTIVITY,
        30,
        1,
      );

      expect(result.myRanking).toBeUndefined();
    });
  });

  describe('getLevelName', () => {
    it('레벨 1-9는 초보 수영러를 반환해야 함', async () => {
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 1,
      });
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue({
        posts: [],
        comments: [],
      });
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(1);
      expect(result.levelInfo.levelName).toBe('초보 수영러');
    });

    it('레벨 10-19는 중급 수영러를 반환해야 함', async () => {
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 10,
      });
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue({
        posts: [],
        comments: [],
      });
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(1);
      expect(result.levelInfo.levelName).toBe('중급 수영러');
    });

    it('레벨 20-29는 상급 수영러를 반환해야 함', async () => {
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 20,
      });
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue({
        posts: [],
        comments: [],
      });
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(1);
      expect(result.levelInfo.levelName).toBe('상급 수영러');
    });

    it('레벨 30-39는 고급 수영러를 반환해야 함', async () => {
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 30,
      });
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue({
        posts: [],
        comments: [],
      });
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(1);
      expect(result.levelInfo.levelName).toBe('고급 수영러');
    });

    it('레벨 40-49는 마스터 수영러를 반환해야 함', async () => {
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 40,
      });
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue({
        posts: [],
        comments: [],
      });
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(1);
      expect(result.levelInfo.levelName).toBe('마스터 수영러');
    });

    it('레벨 50 이상은 전설 수영러를 반환해야 함', async () => {
      mockRepository.findOrCreateUserLevel.mockResolvedValue({
        ...mockUserLevel,
        level: 50,
      });
      mockRepository.getStudentFeedbackStats.mockResolvedValue([]);
      mockRepository.getStudentLectures.mockResolvedValue([]);
      mockRepository.getStudentCommunityStats.mockResolvedValue({
        posts: [],
        comments: [],
      });
      mockRepository.findUserBadges.mockResolvedValue([]);

      const result = await service.getStudentDashboard(1);
      expect(result.levelInfo.levelName).toBe('전설 수영러');
    });
  });
});
