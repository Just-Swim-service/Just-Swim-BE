import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  Matches,
} from 'class-validator';

export class CommunityImageDto {
  @ApiProperty({
    description: '업로드할 파일명 목록',
    example: ['photo1.jpg', 'video1.mp4', 'photo2.png'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1개 이상의 파일이 필요합니다.' })
  @ArrayMaxSize(10, { message: '최대 10개까지 업로드 가능합니다.' })
  @IsString({ each: true })
  @Matches(/\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov|avi)$/i, {
    each: true,
    message:
      '허용되지 않는 파일 형식입니다. (jpg, png, gif, webp, mp4, webm, ogg, mov, avi만 가능)',
  })
  files: string[];
}
