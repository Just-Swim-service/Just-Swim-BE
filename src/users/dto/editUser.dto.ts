import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @ApiProperty({
    example: '홍길동',
    description: '수정할 사용자 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'URL',
    description: '수정할 사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage: string;

  @ApiProperty({
    example: '1995.09.13',
    description: '수정할 사용자 생년월일',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly birth: string;

  @ApiProperty({
    example: '010-1234-1234',
    description: '수정할 사용자 핸드폰 번호',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber: string;
}
