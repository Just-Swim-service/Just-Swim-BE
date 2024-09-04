import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class FeedbackImageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'feedback에 넣을 이미지 입니다. (4개까지만 가능합니다.)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  readonly files?: string[];
}
