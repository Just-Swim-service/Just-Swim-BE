import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FeedbackDto {
  @ApiProperty({
    example: 'group' || 'personal',
    description: 'feedback 타입',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly feedbackType: string;

  @ApiProperty({
    example: '2024.04.22',
    description: 'feedback을 남길 강의 날짜',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly feedbackDate: string;

  @ApiProperty({
    example: 'file1',
    description: 'feedback에 남길 관련 영상 또는 이미지',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly feedbackFile: string;

  @ApiProperty({
    example: 'URL',
    description: 'feedback에 남길 관련 링크',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly feedbackLink: string;

  @ApiProperty({
    example:
      '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
    description: 'feedback 내용',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly feedbackContent: string;

  @ApiProperty({
    example: '1,2,3',
    description: '피드백 대상 userId',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly feedbackTarget: string;
}
