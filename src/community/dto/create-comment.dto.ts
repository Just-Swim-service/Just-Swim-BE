import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '부모 댓글 ID (대댓글인 경우)', required: false })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
