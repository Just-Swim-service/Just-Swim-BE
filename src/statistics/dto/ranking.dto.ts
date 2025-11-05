import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum RankingType {
  STUDENT_ACTIVITY = 'student_activity', // 수강생 활동 랭킹
  INSTRUCTOR_POPULAR = 'instructor_popular', // 인기 강사 랭킹
  COMMUNITY_CONTRIBUTOR = 'community_contributor', // 커뮤니티 기여자 랭킹
  FEEDBACK_RECEIVER = 'feedback_receiver', // 피드백 많이 받은 수강생
}

export class GetRankingQueryDto {
  @ApiProperty({
    description: '랭킹 타입',
    enum: RankingType,
    default: RankingType.STUDENT_ACTIVITY,
  })
  @IsEnum(RankingType)
  @IsOptional()
  type?: RankingType = RankingType.STUDENT_ACTIVITY;

  @ApiProperty({ description: '기간 (일)', default: 30, required: false })
  @IsOptional()
  period?: number = 30;
}

export class RankingUserDto {
  @ApiProperty({ description: '순위' })
  rank: number;

  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ApiProperty({ description: '사용자 이름' })
  name: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '프로필 이미지' })
  profileImage: string;

  @ApiProperty({ description: '레벨' })
  level: number;

  @ApiProperty({ description: '점수/활동 지표' })
  score: number;

  @ApiProperty({ description: '부가 정보 (예: 피드백 수, 게시글 수 등)' })
  details: {
    [key: string]: any;
  };
}

export class RankingResponseDto {
  @ApiProperty({ description: '랭킹 타입' })
  rankingType: RankingType;

  @ApiProperty({ description: '기간 (일)' })
  period: number;

  @ApiProperty({ description: '랭킹 목록', type: [RankingUserDto] })
  rankings: RankingUserDto[];

  @ApiProperty({ description: '내 순위 (로그인한 경우)', required: false })
  myRanking?: RankingUserDto;
}

