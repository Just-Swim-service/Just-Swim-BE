import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, { message: '댓글 내용은 1-1000자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  content: string;

  @ApiProperty({ description: '부모 댓글 ID (대댓글인 경우)', required: false })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
