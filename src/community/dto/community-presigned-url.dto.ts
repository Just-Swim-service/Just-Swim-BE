import { ApiProperty } from '@nestjs/swagger';

export class CommunityPresignedUrlDto {
  @ApiProperty({
    description: 'S3 업로드를 위한 presigned URL',
    example: 'https://bucket.s3.region.amazonaws.com/...',
  })
  presignedUrl: string;

  @ApiProperty({
    description: '파일이 저장될 경로',
    example: 'community/userId/timestamp-filename.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: '파일 타입',
    example: 'image',
    enum: ['image', 'video'],
  })
  fileType: 'image' | 'video';

  @ApiProperty({
    description: 'Content-Type',
    example: 'image/jpeg',
  })
  contentType: string;
}
