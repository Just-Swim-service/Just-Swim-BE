import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class EditProfileImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '수정할 사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  readonly profileImage?: string;
}
