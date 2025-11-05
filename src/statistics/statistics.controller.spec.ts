import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { RankingType } from './dto/ranking.dto';
import { ResponseService } from 'src/common/response/response.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;
  let responseService: ResponseService;

  const mockStudentDashboard = {
    feedbackStats: {
      totalFeedbacks: 10,
      personalFeedbacks: 7,
      groupFeedbacks: 3,
      recentFeedbacks: 5,
      monthlyStats: [{ month: '2024-01', count: 10 }],
    },
    lectureStats: {
      activeLectures: 2,
      totalLectures: 3,
      firstLectureDate: '2024-01-01',
      totalDays: 100,
      lectures: [],
    },
    communityActivity: {
      totalPosts: 15,
      totalComments: 20,
      totalLikes: 50,
      totalBookmarks: 10,
      postsByCategory: [],
    },
    levelInfo: {
      currentLevel: 10,
      currentExp: 45,
      expToNextLevel: 55,
      progress: 45,
      currentStreak: 7,
      longestStreak: 15,
      levelName: '중급 수영러',
    },
    badges: [],
  };

  const mockInstructorDashboard = {
    lectureStats: {
      activeLectures: 3,
      totalLectures: 5,
      totalStudents: 50,
      activeStudents: 40,
      lectureDetails: [],
    },
    feedbackStats: {
      totalFeedbacks: 100,
      personalFeedbacks: 60,
      groupFeedbacks: 40,
      recentFeedbacks: 20,
      monthlyStats: [{ month: '2024-01', count: 100 }],
      averageMonthlyFeedbacks: 25,
    },
    communityStats: {
      totalPosts: 30,
      totalLikes: 200,
      totalComments: 50,
      tipPosts: 15,
      popularPosts: [],
    },
    studentPerformance: [],
  };

  const mockRankings = {
    rankingType: RankingType.STUDENT_ACTIVITY,
    period: 30,
    rankings: [
      {
        rank: 1,
        userId: 1,
        name: '김학생',
        nickname: '열정',
        profileImage: '',
        level: 10,
        score: 150,
        details: {
          feedbackCount: 10,
          postCount: 5,
          commentCount: 20,
          likeCount: 30,
        },
      },
    ],
    myRanking: undefined,
  };

  const mockLevelInfo = {
    currentLevel: 10,
    currentExp: 45,
    expToNextLevel: 55,
    progress: 45,
    currentStreak: 7,
    longestStreak: 15,
    levelName: '중급 수영러',
  };

  const mockBadges = [
    {
      badgeType: 'first_class',
      badgeName: '🎓 첫 수업',
      badgeDescription: '첫 강의에 등록했습니다',
      earnedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockStatisticsService = {
    getStudentDashboard: jest.fn(),
    getInstructorDashboard: jest.fn(),
    getRankings: jest.fn(),
    updateUserExperience: jest.fn(),
    checkAndAwardBadge: jest.fn(),
  };

  const mockResponseService = {
    success: jest.fn((res, message, data) => {
      res.status(200).json({
        statusCode: 200,
        message,
        data,
      });
      return res;
    }),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
        {
          provide: ResponseService,
          useValue: mockResponseService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
    responseService = module.get<ResponseService>(ResponseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCustomerDashboard', () => {
    it('수강생 대시보드를 정상적으로 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue(
        mockStudentDashboard,
      );

      await controller.getCustomerDashboard(res);

      expect(service.getStudentDashboard).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '수강생 대시보드를 조회했습니다.',
        mockStudentDashboard,
      );
    });

    it('올바른 사용자 ID로 서비스를 호출해야 함', async () => {
      const res = {
        locals: { user: { userId: 123 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue(
        mockStudentDashboard,
      );

      await controller.getCustomerDashboard(res);

      expect(service.getStudentDashboard).toHaveBeenCalledWith(123);
    });
  });

  describe('getInstructorDashboard', () => {
    it('강사 대시보드를 정상적으로 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getInstructorDashboard.mockResolvedValue(
        mockInstructorDashboard,
      );

      await controller.getInstructorDashboard(res);

      expect(service.getInstructorDashboard).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '강사 대시보드를 조회했습니다.',
        mockInstructorDashboard,
      );
    });
  });

  describe('getRankings', () => {
    it('기본 파라미터로 랭킹을 조회해야 함', async () => {
      const res = {
        locals: {},
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getRankings.mockResolvedValue(mockRankings);

      await controller.getRankings(RankingType.STUDENT_ACTIVITY, 30, res);

      expect(service.getRankings).toHaveBeenCalledWith(
        RankingType.STUDENT_ACTIVITY,
        30,
        undefined,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '랭킹을 조회했습니다.',
        mockRankings,
      );
    });

    it('로그인한 사용자의 경우 userId를 전달해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getRankings.mockResolvedValue(mockRankings);

      await controller.getRankings(RankingType.STUDENT_ACTIVITY, 30, res);

      expect(service.getRankings).toHaveBeenCalledWith(
        RankingType.STUDENT_ACTIVITY,
        30,
        1,
      );
    });

    it('다양한 랭킹 타입을 처리할 수 있어야 함', async () => {
      const res = {
        locals: {},
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const types = [
        RankingType.STUDENT_ACTIVITY,
        RankingType.INSTRUCTOR_POPULAR,
        RankingType.COMMUNITY_CONTRIBUTOR,
        RankingType.FEEDBACK_RECEIVER,
      ];

      for (const type of types) {
        mockStatisticsService.getRankings.mockResolvedValue({
          ...mockRankings,
          rankingType: type,
        });

        await controller.getRankings(type, 30, res);

        expect(service.getRankings).toHaveBeenCalledWith(type, 30, undefined);
      }
    });

    it('커스텀 기간으로 랭킹을 조회할 수 있어야 함', async () => {
      const res = {
        locals: {},
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const customPeriod = 7;

      mockStatisticsService.getRankings.mockResolvedValue({
        ...mockRankings,
        period: customPeriod,
      });

      await controller.getRankings(
        RankingType.STUDENT_ACTIVITY,
        customPeriod,
        res,
      );

      expect(service.getRankings).toHaveBeenCalledWith(
        RankingType.STUDENT_ACTIVITY,
        customPeriod,
        undefined,
      );
    });
  });

  describe('getMyLevel', () => {
    it('내 레벨 정보를 정상적으로 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue({
        ...mockStudentDashboard,
        levelInfo: mockLevelInfo,
      });

      await controller.getMyLevel(res);

      expect(service.getStudentDashboard).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '레벨 정보를 조회했습니다.',
        mockLevelInfo,
      );
    });

    it('레벨 정보만 추출하여 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue(
        mockStudentDashboard,
      );

      await controller.getMyLevel(res);

      const successCall = mockResponseService.success.mock.calls[0];
      const data = successCall[2];

      expect(data).toHaveProperty('currentLevel');
      expect(data).toHaveProperty('currentExp');
      expect(data).toHaveProperty('expToNextLevel');
      expect(data).toHaveProperty('progress');
      expect(data).toHaveProperty('currentStreak');
      expect(data).toHaveProperty('longestStreak');
      expect(data).toHaveProperty('levelName');
    });
  });

  describe('getMyBadges', () => {
    it('내 배지 목록을 정상적으로 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue({
        ...mockStudentDashboard,
        badges: mockBadges,
      });

      await controller.getMyBadges(res);

      expect(service.getStudentDashboard).toHaveBeenCalledWith(1);
      expect(responseService.success).toHaveBeenCalledWith(
        res,
        '배지 목록을 조회했습니다.',
        mockBadges,
      );
    });

    it('배지 정보만 추출하여 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue(
        mockStudentDashboard,
      );

      await controller.getMyBadges(res);

      const successCall = mockResponseService.success.mock.calls[0];
      const data = successCall[2];

      expect(Array.isArray(data)).toBe(true);
    });

    it('배지가 없는 경우 빈 배열을 반환해야 함', async () => {
      const res = {
        locals: { user: { userId: 1 } },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockStatisticsService.getStudentDashboard.mockResolvedValue({
        ...mockStudentDashboard,
        badges: [],
      });

      await controller.getMyBadges(res);

      const successCall = mockResponseService.success.mock.calls[0];
      const data = successCall[2];

      expect(data).toEqual([]);
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
