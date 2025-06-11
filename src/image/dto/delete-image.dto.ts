import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({ description: '삭제할 이미지의 S3 URL' })
  @IsString()
  readonly fileURL: string;
}
