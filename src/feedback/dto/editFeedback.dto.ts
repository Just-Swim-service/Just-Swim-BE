import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FeedbackType } from '../enum/feedbackType.enum';
import { FeedbackTargetDto } from './feedbackTarget.dto';
import { Type } from 'class-transformer';

export class EditFeedbackDto {
  @ApiProperty({
    example: 'group',
    description: 'feedback 타입',
    enum: FeedbackType,
    required: false,
  })
  @IsOptional()
  @IsEnum(FeedbackType)
  readonly feedbackType: FeedbackType;

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
    example: [
      { lectureId: 1, userIds: [2, 3] },
      { lectureId: 2, userIds: [4, 5, 13] },
    ],
    description: 'lectureId와 userIds 쌍의 배열',
    required: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackTargetDto)
  readonly feedbackTarget: FeedbackTargetDto[];
}
