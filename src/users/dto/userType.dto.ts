import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserTypeDto {
  @ApiProperty({
    example: '유저 타입',
    description: 'userType',
    required: true,
  })
  @IsString()
  @IsIn(['instructor', 'customer'], {
    message: 'userType은 instructor 또는 customer여야 합니다.',
  })
  @IsNotEmpty()
  userType: string;
}
