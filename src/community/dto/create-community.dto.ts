import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CategoryType } from '../enum/category-type.enum';
import { CreateCommunityImageDto } from './create-community-image.dto';

export class CreateCommunityDto {
  @ApiProperty({ description: '게시글 제목' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100, { message: '게시글 제목은 1-100자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000, { message: '게시글 내용은 1-5000자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim())
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
  @ArrayMaxSize(5, { message: '태그는 최대 5개까지 가능합니다.' })
  @IsString({ each: true })
  @Length(1, 20, { each: true, message: '각 태그는 1-20자 사이여야 합니다.' })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: '운동 관련 데이터', required: false })
  @IsOptional()
  @IsObject()
  workoutData?: any;

  @ApiProperty({
    description: '이미지 또는 동영상 정보 배열',
    type: [CreateCommunityImageDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: '이미지는 최대 10개까지 가능합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateCommunityImageDto)
  communityImages?: CreateCommunityImageDto[];
}
