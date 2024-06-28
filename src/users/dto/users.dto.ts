import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserType } from '../enum/userType.enum';

export class UsersDto {
  @ApiProperty({
    example: 'kakao',
    description: '로그인 제공 사이트',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
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
  readonly email: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'URL',
    description: '사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly profileImage?: string;

  @ApiProperty({
    example: '1995.09.13',
    description: '사용자 생년월일',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly birth?: string;

  @ApiProperty({
    example: '010-1234-1234',
    description: '사용자 핸드폰 번호',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;
}
