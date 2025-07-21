import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateFeedbackImageDto {
  @ApiProperty({ example: 'test.jpg', description: '파일 이름' })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/feedback/1/1234567890-test.jpg',
    description: '파일 S3 경로',
  })
  @IsString()
  filePath: string;

  @ApiProperty({ example: 'image', enum: ['image', 'video'] })
  @IsString()
  fileType: string;

  @ApiProperty({ example: 123456, description: '파일 크기(Byte)' })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    example: 7.5,
    description: '동영상일 경우 재생 시간(초)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/feedback/1/thumbnail.jpg',
    description: '동영상 썸네일 경로',
    required: false,
  })
  @IsOptional()
  @IsString()
  thumbnailPath?: string;
}
