import { Injectable } from '@nestjs/common';
import { StatisticsRepository } from './statistics.repository';
import {
  StudentDashboardResponseDto,
  FeedbackStatsDto,
  LectureStatsDto,
  CommunityActivityDto,
  LevelInfoDto,
  BadgeInfoDto,
} from './dto/student-dashboard.dto';
import {
  InstructorDashboardResponseDto,
  InstructorLectureStatsDto,
  InstructorFeedbackStatsDto,
  InstructorCommunityStatsDto,
  StudentPerformanceDto,
} from './dto/instructor-dashboard.dto';
import {
  RankingResponseDto,
  RankingType,
  RankingUserDto,
} from './dto/ranking.dto';
import { BadgeType } from './enum/badge-type.enum';
import { FeedbackType } from 'src/feedback/enum/feedback-type.enum';
import { CategoryType } from 'src/community/enum/category-type.enum';

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  // 레벨 이름 반환
  private getLevelName(level: number): string {
    if (level >= 50) return '전설 수영러';
    if (level >= 40) return '마스터 수영러';
    if (level >= 30) return '고급 수영러';
    if (level >= 20) return '상급 수영러';
    if (level >= 10) return '중급 수영러';
    return '초보 수영러';
  }

  // 배지 이름 및 설명 반환
  private getBadgeInfo(badgeType: BadgeType): {
    name: string;
    description: string;
  } {
    const badgeMap = {
      [BadgeType.FIRST_CLASS]: {
        name: '🎓 첫 수업',
        description: '첫 강의에 등록했습니다',
      },
      [BadgeType.ATTENDANCE_7]: {
        name: '🔥 7일 연속',
        description: '7일 연속으로 활동했습니다',
      },
      [BadgeType.ATTENDANCE_30]: {
        name: '🔥🔥 30일 연속',
        description: '30일 연속으로 활동했습니다',
      },
      [BadgeType.ATTENDANCE_100]: {
        name: '🔥🔥🔥 100일 연속',
        description: '100일 연속으로 활동했습니다',
      },
      [BadgeType.FIRST_FEEDBACK]: {
        name: '📝 첫 피드백',
        description: '첫 피드백을 받았습니다',
      },
      [BadgeType.FEEDBACK_10]: {
        name: '📝✨ 피드백 10회',
        description: '피드백을 10회 받았습니다',
      },
      [BadgeType.FEEDBACK_50]: {
        name: '📝⭐ 피드백 50회',
        description: '피드백을 50회 받았습니다',
      },
      [BadgeType.FEEDBACK_100]: {
        name: '📝🏆 피드백 100회',
        description: '피드백을 100회 받았습니다',
      },
      [BadgeType.FIRST_POST]: {
        name: '✍️ 첫 게시글',
        description: '첫 게시글을 작성했습니다',
      },
      [BadgeType.POST_10]: {
        name: '✍️✨ 게시글 10개',
        description: '게시글을 10개 작성했습니다',
      },
      [BadgeType.POST_50]: {
        name: '✍️⭐ 게시글 50개',
        description: '게시글을 50개 작성했습니다',
      },
      [BadgeType.COMMENT_100]: {
        name: '💬 댓글왕',
        description: '댓글을 100개 작성했습니다',
      },
      [BadgeType.POPULAR_POST]: {
        name: '🌟 인기글',
        description: '좋아요 100개 이상 받은 글을 작성했습니다',
      },
      [BadgeType.HELPFUL_MEMBER]: {
        name: '🎯 도움러',
        description: '수영팁을 10개 작성했습니다',
      },
      [BadgeType.FIRST_STUDENT]: {
        name: '👨‍🏫 첫 수강생',
        description: '첫 수강생을 받았습니다',
      },
      [BadgeType.STUDENTS_10]: {
        name: '👨‍🏫✨ 수강생 10명',
        description: '수강생 10명을 가르쳤습니다',
      },
      [BadgeType.STUDENTS_50]: {
        name: '👨‍🏫⭐ 수강생 50명',
        description: '수강생 50명을 가르쳤습니다',
      },
      [BadgeType.FEEDBACK_MASTER]: {
        name: '🏆 피드백 마스터',
        description: '피드백을 100회 제공했습니다',
      },
      [BadgeType.POPULAR_INSTRUCTOR]: {
        name: '⭐ 인기 강사',
        description: '커뮤니티에서 좋아요 500개 이상 받았습니다',
      },
      [BadgeType.EARLY_BIRD]: {
        name: '🐦 얼리버드',
        description: '서비스 초기 가입자입니다',
      },
      [BadgeType.VETERAN]: {
        name: '🎖️ 베테랑',
        description: '1년 이상 활동했습니다',
      },
      [BadgeType.LEGEND]: {
        name: '👑 전설',
        description: '레벨 50을 달성했습니다',
      },
    };

    return (
      badgeMap[badgeType] || { name: '배지', description: '배지를 획득했습니다' }
    );
  }

  // 경험치 계산 및 레벨 업데이트
  async updateUserExperience(
    userId: number,
    expGain: number,
  ): Promise<void> {
    const userLevel =
      await this.statisticsRepository.findOrCreateUserLevel(userId);

    userLevel.experience += expGain;

    // 레벨 업 계산 (100 exp per level)
    const newLevel = Math.floor(userLevel.experience / 100) + 1;
    if (newLevel > userLevel.level) {
      userLevel.level = newLevel;
      // 레벨 50 달성 시 전설 배지
      if (newLevel >= 50) {
        await this.checkAndAwardBadge(userId, BadgeType.LEGEND);
      }
    }

    // 연속 일수 업데이트
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (userLevel.lastActivityDate) {
      const lastActivity = new Date(userLevel.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        // 연속
        userLevel.currentStreak += 1;
        if (userLevel.currentStreak > userLevel.longestStreak) {
          userLevel.longestStreak = userLevel.currentStreak;
        }
      } else if (dayDiff > 1) {
        // 끊김
        userLevel.currentStreak = 1;
      }
      // dayDiff === 0이면 오늘 이미 활동했으므로 변경 없음
    } else {
      userLevel.currentStreak = 1;
      userLevel.longestStreak = 1;
    }

    userLevel.lastActivityDate = new Date();

    await this.statisticsRepository.updateUserLevel(userLevel);

    // 스트릭 배지 체크
    if (userLevel.currentStreak >= 100) {
      await this.checkAndAwardBadge(userId, BadgeType.ATTENDANCE_100);
    } else if (userLevel.currentStreak >= 30) {
      await this.checkAndAwardBadge(userId, BadgeType.ATTENDANCE_30);
    } else if (userLevel.currentStreak >= 7) {
      await this.checkAndAwardBadge(userId, BadgeType.ATTENDANCE_7);
    }
  }

  // 배지 확인 및 수여
  async checkAndAwardBadge(
    userId: number,
    badgeType: BadgeType,
  ): Promise<void> {
    const hasBadge = await this.statisticsRepository.hasBadge(
      userId,
      badgeType,
    );
    if (!hasBadge) {
      const badgeInfo = this.getBadgeInfo(badgeType);
      await this.statisticsRepository.addBadge(
        userId,
        badgeType,
        badgeInfo.description,
      );
    }
  }

  // 수강생 대시보드
  async getStudentDashboard(
    userId: number,
  ): Promise<StudentDashboardResponseDto> {
    // 피드백 통계
    const feedbackTargets =
      await this.statisticsRepository.getStudentFeedbackStats(userId);
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);
    const recentFeedbackTargets =
      await this.statisticsRepository.getStudentFeedbackStats(
        userId,
        recentDate,
      );

    const personalFeedbacks = feedbackTargets.filter(
      (ft) => ft.feedback?.feedbackType === FeedbackType.Personal,
    ).length;
    const groupFeedbacks = feedbackTargets.filter(
      (ft) => ft.feedback?.feedbackType === FeedbackType.Group,
    ).length;

    // 월별 피드백 통계
    const monthlyMap = new Map<string, number>();
    feedbackTargets.forEach((ft) => {
      const month = ft.feedbackTargetCreatedAt.toISOString().substring(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const feedbackStats: FeedbackStatsDto = {
      totalFeedbacks: feedbackTargets.length,
      personalFeedbacks,
      groupFeedbacks,
      recentFeedbacks: recentFeedbackTargets.length,
      monthlyStats,
    };

    // 강의 통계
    const lectures =
      await this.statisticsRepository.getStudentLectures(userId);
    const activeLectures = lectures.filter(
      (m) => !m.lecture.lectureEndDate || new Date(m.lecture.lectureEndDate) >= new Date(),
    ).length;

    const firstLecture = lectures[0];
    const totalDays = firstLecture
      ? Math.floor(
          (new Date().getTime() -
            new Date(firstLecture.memberCreatedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const lectureStats: LectureStatsDto = {
      activeLectures,
      totalLectures: lectures.length,
      firstLectureDate: firstLecture
        ? firstLecture.memberCreatedAt.toISOString().split('T')[0]
        : '',
      totalDays,
      lectures: lectures.map((m) => ({
        lectureId: m.lecture.lectureId,
        lectureTitle: m.lecture.lectureTitle,
        instructorName: m.lecture.user.name,
        startDate: m.memberCreatedAt.toISOString().split('T')[0],
        isActive: !m.lecture.lectureEndDate || new Date(m.lecture.lectureEndDate) >= new Date(),
      })),
    };

    // 커뮤니티 활동
    const { posts, comments } =
      await this.statisticsRepository.getStudentCommunityStats(userId);

    const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);
    const totalBookmarks = posts.reduce(
      (sum, post) => sum + (post.bookmarks?.length || 0),
      0,
    );

    const categoryMap = new Map<string, number>();
    posts.forEach((post) => {
      categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
    });

    const postsByCategory = Array.from(categoryMap.entries()).map(
      ([category, count]) => ({ category, count }),
    );

    // 운동 기록 통계
    const workoutPosts = posts.filter(
      (p) => p.category === CategoryType.RECORD && p.workoutData,
    );
    const workoutStats = workoutPosts.length > 0 ? {
      totalWorkouts: workoutPosts.length,
      totalDistance: workoutPosts.reduce(
        (sum, p) => sum + (p.workoutData?.distance || 0),
        0,
      ),
      totalDuration: workoutPosts.reduce(
        (sum, p) => sum + (p.workoutData?.duration || 0),
        0,
      ),
    } : undefined;

    const communityActivity: CommunityActivityDto = {
      totalPosts: posts.length,
      totalComments: comments.length,
      totalLikes,
      totalBookmarks,
      postsByCategory,
      workoutStats,
    };

    // 레벨 정보
    const userLevel =
      await this.statisticsRepository.findOrCreateUserLevel(userId);
    const expForNextLevel = userLevel.level * 100;
    const currentLevelExp = userLevel.experience - (userLevel.level - 1) * 100;

    const levelInfo: LevelInfoDto = {
      currentLevel: userLevel.level,
      currentExp: currentLevelExp,
      expToNextLevel: expForNextLevel - currentLevelExp,
      progress: Math.floor((currentLevelExp / 100) * 100),
      currentStreak: userLevel.currentStreak,
      longestStreak: userLevel.longestStreak,
      levelName: this.getLevelName(userLevel.level),
    };

    // 배지 정보
    const userBadges =
      await this.statisticsRepository.findUserBadges(userId);
    const badges: BadgeInfoDto[] = userBadges.map((badge) => {
      const badgeInfo = this.getBadgeInfo(badge.badgeType);
      return {
        badgeType: badge.badgeType,
        badgeName: badgeInfo.name,
        badgeDescription: badge.badgeDescription || badgeInfo.description,
        earnedAt: badge.earnedAt.toISOString(),
      };
    });

    return {
      feedbackStats,
      lectureStats,
      communityActivity,
      levelInfo,
      badges,
    };
  }

  // 강사 대시보드
  async getInstructorDashboard(
    userId: number,
  ): Promise<InstructorDashboardResponseDto> {
    // 강의 통계
    const lectures =
      await this.statisticsRepository.getInstructorLectures(userId);
    const activeLectures = lectures.filter(
      (l) => !l.lectureEndDate || new Date(l.lectureEndDate) >= new Date(),
    ).length;

    const allStudents = new Set<number>();
    const activeStudents = new Set<number>();

    lectures.forEach((lecture) => {
      lecture.member?.forEach((member) => {
        if (!member.memberDeletedAt) {
          allStudents.add(member.user.userId);
          if (!lecture.lectureEndDate || new Date(lecture.lectureEndDate) >= new Date()) {
            activeStudents.add(member.user.userId);
          }
        }
      });
    });

    const lectureStats: InstructorLectureStatsDto = {
      activeLectures,
      totalLectures: lectures.length,
      totalStudents: allStudents.size,
      activeStudents: activeStudents.size,
      lectureDetails: lectures.map((l) => ({
        lectureId: l.lectureId,
        lectureTitle: l.lectureTitle,
        studentCount: l.member?.filter((m) => !m.memberDeletedAt).length || 0,
        createdAt: l.lectureCreatedAt.toISOString().split('T')[0],
        isActive: !l.lectureEndDate || new Date(l.lectureEndDate) >= new Date(),
      })),
    };

    // 피드백 통계
    const feedbacks =
      await this.statisticsRepository.getInstructorFeedbackStats(userId);
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);
    const recentFeedbacks =
      await this.statisticsRepository.getInstructorFeedbackStats(
        userId,
        recentDate,
      );

    const personalFeedbacks = feedbacks.filter(
      (f) => f.feedbackType === FeedbackType.Personal,
    ).length;
    const groupFeedbacks = feedbacks.filter(
      (f) => f.feedbackType === FeedbackType.Group,
    ).length;

    const monthlyMap = new Map<string, number>();
    feedbacks.forEach((f) => {
      const month = f.feedbackCreatedAt.toISOString().substring(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const averageMonthlyFeedbacks =
      monthlyStats.length > 0
        ? Math.floor(
            monthlyStats.reduce((sum, m) => sum + m.count, 0) /
              monthlyStats.length,
          )
        : 0;

    const feedbackStats: InstructorFeedbackStatsDto = {
      totalFeedbacks: feedbacks.length,
      personalFeedbacks,
      groupFeedbacks,
      recentFeedbacks: recentFeedbacks.length,
      monthlyStats,
      averageMonthlyFeedbacks,
    };

    // 커뮤니티 통계
    const posts =
      await this.statisticsRepository.getInstructorCommunityStats(userId);
    const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.commentCount, 0);
    const tipPosts = posts.filter((p) => p.category === CategoryType.TIP).length;

    const popularPosts = posts
      .filter((p) => p.likeCount >= 10)
      .slice(0, 5)
      .map((p) => ({
        communityId: p.communityId,
        title: p.title,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
      }));

    const communityStats: InstructorCommunityStatsDto = {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      tipPosts,
      popularPosts,
    };

    // 수강생 성과 (각 강의의 수강생별 피드백 현황)
    const studentPerformance: StudentPerformanceDto[] = [];
    const studentMap = new Map<number, any>();

    lectures.forEach((lecture) => {
      lecture.member?.forEach((member) => {
        if (!member.memberDeletedAt && !studentMap.has(member.user.userId)) {
          studentMap.set(member.user.userId, {
            userId: member.user.userId,
            name: member.user.name,
            nickname: member.memberNickname || '',
            profileImage: member.user.profileImage || '',
            joinedDate: member.memberCreatedAt.toISOString().split('T')[0],
            lectureTitle: lecture.lectureTitle,
          });
        }
      });
    });

    for (const [userId, student] of studentMap.entries()) {
      const feedbackTargets =
        await this.statisticsRepository.getStudentFeedbackStats(userId);
      const lastFeedback = feedbackTargets[feedbackTargets.length - 1];

      studentPerformance.push({
        ...student,
        feedbackCount: feedbackTargets.length,
        lastFeedbackDate: lastFeedback
          ? lastFeedback.feedbackTargetCreatedAt.toISOString().split('T')[0]
          : '',
      });
    }

    return {
      lectureStats,
      feedbackStats,
      communityStats,
      studentPerformance: studentPerformance.sort(
        (a, b) => b.feedbackCount - a.feedbackCount,
      ),
    };
  }

  // 랭킹 조회
  async getRankings(
    type: RankingType,
    period: number = 30,
    currentUserId?: number,
  ): Promise<RankingResponseDto> {
    let rankings: any[] = [];

    if (
      type === RankingType.STUDENT_ACTIVITY ||
      type === RankingType.FEEDBACK_RECEIVER
    ) {
      rankings = await this.statisticsRepository.getActiveStudentsRanking(
        50,
        period,
      );
    } else if (type === RankingType.INSTRUCTOR_POPULAR) {
      rankings = await this.statisticsRepository.getPopularInstructorsRanking(
        50,
        period,
      );
    } else if (type === RankingType.COMMUNITY_CONTRIBUTOR) {
      rankings = await this.statisticsRepository.getActiveStudentsRanking(
        50,
        period,
      );
    }

    const rankingUsers: RankingUserDto[] = rankings.map((r, index) => ({
      rank: index + 1,
      userId: parseInt(r.userId),
      name: r.name,
      nickname: r.nickname || '',
      profileImage: r.profileImage || '',
      level: parseInt(r.level) || 1,
      score: parseInt(r.score) || 0,
      details: {
        feedbackCount: parseInt(r.feedbackCount) || 0,
        postCount: parseInt(r.postCount) || 0,
        commentCount: parseInt(r.commentCount) || 0,
        likeCount: parseInt(r.likeCount) || 0,
        studentCount: parseInt(r.studentCount) || 0,
      },
    }));

    let myRanking: RankingUserDto | undefined;
    if (currentUserId) {
      const myIndex = rankingUsers.findIndex((r) => r.userId === currentUserId);
      if (myIndex >= 0) {
        myRanking = rankingUsers[myIndex];
      }
    }

    return {
      rankingType: type,
      period,
      rankings: rankingUsers,
      myRanking,
    };
  }
}

