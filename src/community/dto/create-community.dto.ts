import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityDto {
  @ApiProperty({ description: '게시글 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '운동 관련 데이터', required: false })
  @IsOptional()
  @IsObject()
  workoutData?: any;
}
