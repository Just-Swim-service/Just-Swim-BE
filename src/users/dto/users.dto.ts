import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UsersDto {
  @ApiProperty({
    example: 'customer',
    description: 'userType',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly userType: string;

  @ApiProperty({
    example: '로그인 제공 사이트',
    description: 'provider',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly provider: string;

  @ApiProperty({
    example: '유저 이메일',
    description: 'email',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty({
    example: '유저 이름',
    description: 'name',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: '유저 프로필 이미지',
    description: 'profileImage',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly profileImage?: string;

  @ApiProperty({
    example: '유저 생년월일',
    description: 'birth',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly birth?: string;

  @ApiProperty({
    example: '유저 전화 번호',
    description: 'phoneNumber',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;
}
