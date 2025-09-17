import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class EditUserDto {
  @ApiProperty({
    example: '홍길동',
    description: '수정할 사용자 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '이름은 1-50자 사이여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly name?: string;

  @ApiProperty({
    example: 'URL',
    description: '수정할 사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '프로필 이미지 URL은 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  profileImage?: string;

  @ApiProperty({
    example: '1995.09.13',
    description: '수정할 사용자 생년월일',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}\.\d{2}\.\d{2}$/, {
    message: '생년월일은 YYYY.MM.DD 형식이어야 합니다.',
  })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly birth?: string;

  @ApiProperty({
    example: '010-1234-1234',
    description: '수정할 사용자 핸드폰 번호',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '핸드폰 번호는 010-XXXX-XXXX 형식이어야 합니다.',
  })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly phoneNumber?: string;
}
