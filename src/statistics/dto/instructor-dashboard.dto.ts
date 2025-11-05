import { ApiProperty } from '@nestjs/swagger';

export class InstructorLectureStatsDto {
  @ApiProperty({ description: '활성 강의 수' })
  activeLectures: number;

  @ApiProperty({ description: '총 생성한 강의 수' })
  totalLectures: number;

  @ApiProperty({ description: '총 수강생 수' })
  totalStudents: number;

  @ApiProperty({ description: '현재 활성 수강생 수' })
  activeStudents: number;

  @ApiProperty({ description: '강의별 수강생 수', type: [Object] })
  lectureDetails: {
    lectureId: number;
    lectureTitle: string;
    studentCount: number;
    createdAt: string;
    isActive: boolean;
  }[];
}

export class InstructorFeedbackStatsDto {
  @ApiProperty({ description: '총 제공한 피드백 수' })
  totalFeedbacks: number;

  @ApiProperty({ description: '개인 피드백 수' })
  personalFeedbacks: number;

  @ApiProperty({ description: '그룹 피드백 수' })
  groupFeedbacks: number;

  @ApiProperty({ description: '최근 30일 피드백 수' })
  recentFeedbacks: number;

  @ApiProperty({ description: '월별 피드백 제공 통계', type: [Object] })
  monthlyStats: {
    month: string;
    count: number;
  }[];

  @ApiProperty({ description: '평균 월간 피드백 수' })
  averageMonthlyFeedbacks: number;
}

export class InstructorCommunityStatsDto {
  @ApiProperty({ description: '작성한 게시글 수' })
  totalPosts: number;

  @ApiProperty({ description: '받은 좋아요 수' })
  totalLikes: number;

  @ApiProperty({ description: '받은 댓글 수' })
  totalComments: number;

  @ApiProperty({ description: '수영팁 게시글 수' })
  tipPosts: number;

  @ApiProperty({ description: '인기 게시글 (좋아요 10개 이상)', type: [Object] })
  popularPosts: {
    communityId: number;
    title: string;
    likeCount: number;
    commentCount: number;
  }[];
}

export class StudentPerformanceDto {
  @ApiProperty({ description: '수강생 ID' })
  userId: number;

  @ApiProperty({ description: '수강생 이름' })
  name: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '프로필 이미지' })
  profileImage: string;

  @ApiProperty({ description: '수강 시작일' })
  joinedDate: string;

  @ApiProperty({ description: '받은 피드백 수' })
  feedbackCount: number;

  @ApiProperty({ description: '최근 피드백 날짜' })
  lastFeedbackDate: string;

  @ApiProperty({ description: '수강 중인 강의 제목' })
  lectureTitle: string;
}

export class InstructorDashboardResponseDto {
  @ApiProperty({ description: '강의 통계' })
  lectureStats: InstructorLectureStatsDto;

  @ApiProperty({ description: '피드백 통계' })
  feedbackStats: InstructorFeedbackStatsDto;

  @ApiProperty({ description: '커뮤니티 통계' })
  communityStats: InstructorCommunityStatsDto;

  @ApiProperty({ description: '수강생 성과 현황', type: [StudentPerformanceDto] })
  studentPerformance: StudentPerformanceDto[];
}

