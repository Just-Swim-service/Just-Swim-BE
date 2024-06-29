import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class FeedbackTargetDto {
  @ApiProperty({
    example: 1,
    description: 'Lecture ID',
    required: true,
  })
  @IsNotEmpty()
  readonly lectureId: number;

  @ApiProperty({
    example: [2, 3],
    description: 'User IDs',
    required: true,
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  readonly userIds: number[];
}
