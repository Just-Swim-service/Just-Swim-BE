import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateCommunityImageDto {
  @ApiProperty({
    description: '파일 경로 (S3 URL)',
    example:
      'https://bucket.s3.region.amazonaws.com/community/userId/timestamp-filename.jpg',
  })
  @IsNotEmpty()
  @IsString()
  readonly filePath: string;

  @ApiProperty({
    description: '파일 타입',
    example: 'image',
    enum: ['image', 'video'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['image', 'video'])
  readonly fileType: 'image' | 'video';

  @ApiProperty({
    description: '원본 파일명',
    example: 'my-photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255, { message: '파일명은 1-255자 사이여야 합니다.' })
  readonly fileName?: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  readonly fileSize?: number;

  @ApiProperty({
    description: '동영상 길이 (초)',
    example: '120',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly duration?: string;

  @ApiProperty({
    description: '동영상 썸네일 경로',
    example:
      'https://bucket.s3.region.amazonaws.com/community/userId/timestamp-filename-thumb.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly thumbnailPath?: string;
}
