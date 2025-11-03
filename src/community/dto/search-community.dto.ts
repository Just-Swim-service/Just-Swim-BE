import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { CategoryType } from '../enum/category-type.enum';

export class SearchCommunityDto {
  @ApiProperty({
    description: '검색어',
    example: '자유형',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200, { message: '검색어는 1-200자 사이여야 합니다.' })
  query?: string;

  @ApiProperty({
    description: '카테고리 필터',
    enum: CategoryType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  category?: CategoryType;

  @ApiProperty({
    description: '태그 필터',
    example: ['자유형', '평영'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: '시작 날짜',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '최소 좋아요 수',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minLikes?: number;

  @ApiProperty({
    description: '최소 댓글 수',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minComments?: number;

  @ApiProperty({
    description: '정렬 기준',
    enum: ['recent', 'popular', 'relevance', 'likes', 'comments', 'views'],
    example: 'relevance',
    required: false,
  })
  @IsOptional()
  @IsEnum(['recent', 'popular', 'relevance', 'likes', 'comments', 'views'])
  sortBy?: 'recent' | 'popular' | 'relevance' | 'likes' | 'comments' | 'views';

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
