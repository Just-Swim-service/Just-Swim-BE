import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class EditFeedbackDto {
  @ApiProperty({
    example: 'group' || 'personal',
    description: 'feedback 수정 타입',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly feedbackType: string;

  @ApiProperty({
    example: '2024.04.22',
    description: 'feedback을 남길 강의 수정 날짜',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly feedbackDate: string;

  @ApiProperty({
    example: 'URL',
    description: 'feedback에 남길 관련 수정 링크 ',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly feedbackLink: string;

  @ApiProperty({
    example:
      '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
    description: 'feedback 수정 내용',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly feedbackContent: string;

  @ApiProperty({
    example: '1,2,3',
    description: '피드백 대상 수정',
    required: true,
  })
  @IsOptional()
  @IsString()
  readonly feedbackTarget: string;
}
