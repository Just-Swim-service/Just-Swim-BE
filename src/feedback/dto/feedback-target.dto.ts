import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FeedbackTargetDto {
  @ApiProperty({
    example: 1,
    description: 'Lecture ID',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber({}, { message: '강의 ID는 숫자여야 합니다.' })
  @IsPositive({ message: '강의 ID는 양수여야 합니다.' })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  readonly lectureId: number;

  @ApiProperty({
    example: [2, 3],
    description: 'User IDs',
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: '사용자 ID는 최소 1개 이상이어야 합니다.' })
  @ArrayMaxSize(50, { message: '사용자 ID는 최대 50개까지 가능합니다.' })
  @IsNumber({}, { each: true, message: '모든 사용자 ID는 숫자여야 합니다.' })
  @IsPositive({ each: true, message: '모든 사용자 ID는 양수여야 합니다.' })
  @Type(() => Number)
  @Transform(({ value }) => value.map((id: any) => parseInt(id)))
  readonly userIds: number[];
}
