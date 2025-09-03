import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { UserType } from '../enum/user-type.enum';
import { Transform } from 'class-transformer';

export class CreateUsersDto {
  @ApiProperty({
    example: 'kakao',
    description: '로그인 제공 사이트',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50, { message: '제공자는 1-50자 사이여야 합니다.' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: '제공자는 영문, 숫자, _, - 만 사용할 수 있습니다.',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  readonly provider: string;

  @ApiProperty({
    example: 'instructor',
    description: '사용자 타입',
    enum: UserType,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserType)
  readonly userType?: UserType;

  @ApiProperty({
    example: 'test@example.com',
    description: '사용자 이메일',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: '유효한 이메일 형식이어야 합니다.' })
  @Length(1, 255, { message: '이메일은 1-255자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  readonly email: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50, { message: '이름은 1-50자 사이여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '이름은 한글, 영문, 숫자, 공백만 사용할 수 있습니다.',
  })
  @Transform(({ value }) => value?.trim())
  readonly name: string;

  @ApiProperty({
    example: 'URL',
    description: '사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '유효한 URL 형식이어야 합니다.' })
  @Length(0, 500, { message: '프로필 이미지 URL은 500자 이하여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  readonly profileImage?: string;
}
