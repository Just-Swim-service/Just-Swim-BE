import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { FeedbackDto } from 'src/feedback/dto/feedback.dto';

export class FeedbackImageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'feedback에 넣을 이미지 입니다. (4개까지만 가능합니다.)',
    required: false,
  })
  @IsOptional()
  readonly files?: any[];

  @ApiProperty({
    description: '피드백 데이터',
    type: FeedbackDto,
  })
  feedbackDto: FeedbackDto;
}
