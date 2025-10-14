import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../enum/category-type.enum';

export class CreateCommunityDto {
  @ApiProperty({ description: '게시글 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '카테고리',
    enum: CategoryType,
    default: CategoryType.STORY,
  })
  @IsEnum(CategoryType)
  @IsOptional()
  category?: CategoryType;

  @ApiProperty({
    description: '태그 목록 (예: ["자유형", "평영", "초보"])',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: '운동 관련 데이터', required: false })
  @IsOptional()
  @IsObject()
  workoutData?: any;
}
