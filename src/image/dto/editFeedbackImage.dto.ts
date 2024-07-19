import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { EditFeedbackDto } from 'src/feedback/dto/editFeedback.dto';

export class EditFeedbackImageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'feedback에 넣을 이미지 입니다. (4개까지만 가능합니다.)',
    required: false,
  })
  @IsOptional()
  readonly files?: any[];

  @ApiProperty({
    description: '피드백 수정 데이터',
    type: EditFeedbackDto,
  })
  editFeedbackDto: EditFeedbackDto;
}
