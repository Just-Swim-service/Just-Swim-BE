import { ApiProperty } from '@nestjs/swagger';

export class FeedbackStatsDto {
  @ApiProperty({ description: '총 받은 피드백 수' })
  totalFeedbacks: number;

  @ApiProperty({ description: '개인 피드백 수' })
  personalFeedbacks: number;

  @ApiProperty({ description: '그룹 피드백 수' })
  groupFeedbacks: number;

  @ApiProperty({ description: '최근 30일 피드백 수' })
  recentFeedbacks: number;

  @ApiProperty({ description: '월별 피드백 통계', type: [Object] })
  monthlyStats: {
    month: string;
    count: number;
  }[];
}

export class LectureStatsDto {
  @ApiProperty({ description: '수강 중인 강의 수' })
  activeLectures: number;

  @ApiProperty({ description: '총 수강한 강의 수' })
  totalLectures: number;

  @ApiProperty({ description: '수강 시작일' })
  firstLectureDate: string;

  @ApiProperty({ description: '총 수강 기간 (일)' })
  totalDays: number;

  @ApiProperty({ description: '강의 목록', type: [Object] })
  lectures: {
    lectureId: number;
    lectureTitle: string;
    instructorName: string;
    startDate: string;
    isActive: boolean;
  }[];
}

export class CommunityActivityDto {
  @ApiProperty({ description: '작성한 게시글 수' })
  totalPosts: number;

  @ApiProperty({ description: '작성한 댓글 수' })
  totalComments: number;

  @ApiProperty({ description: '받은 좋아요 수' })
  totalLikes: number;

  @ApiProperty({ description: '북마크된 횟수' })
  totalBookmarks: number;

  @ApiProperty({ description: '카테고리별 게시글 수', type: [Object] })
  postsByCategory: {
    category: string;
    count: number;
  }[];

  @ApiProperty({ description: '운동 기록 통계', required: false })
  workoutStats?: {
    totalWorkouts: number;
    totalDistance?: number;
    totalDuration?: number;
  };
}

export class LevelInfoDto {
  @ApiProperty({ description: '현재 레벨' })
  currentLevel: number;

  @ApiProperty({ description: '현재 경험치' })
  currentExp: number;

  @ApiProperty({ description: '다음 레벨까지 필요한 경험치' })
  expToNextLevel: number;

  @ApiProperty({ description: '레벨 진행률 (%)' })
  progress: number;

  @ApiProperty({ description: '현재 연속 활동 일수' })
  currentStreak: number;

  @ApiProperty({ description: '최장 연속 활동 일수' })
  longestStreak: number;

  @ApiProperty({ description: '레벨 이름' })
  levelName: string;
}

export class BadgeInfoDto {
  @ApiProperty({ description: '배지 타입' })
  badgeType: string;

  @ApiProperty({ description: '배지 이름' })
  badgeName: string;

  @ApiProperty({ description: '배지 설명' })
  badgeDescription: string;

  @ApiProperty({ description: '획득 날짜' })
  earnedAt: string;
}

export class StudentDashboardResponseDto {
  @ApiProperty({ description: '피드백 통계' })
  feedbackStats: FeedbackStatsDto;

  @ApiProperty({ description: '강의 통계' })
  lectureStats: LectureStatsDto;

  @ApiProperty({ description: '커뮤니티 활동' })
  communityActivity: CommunityActivityDto;

  @ApiProperty({ description: '레벨 정보' })
  levelInfo: LevelInfoDto;

  @ApiProperty({ description: '획득한 배지 목록', type: [BadgeInfoDto] })
  badges: BadgeInfoDto[];
}

