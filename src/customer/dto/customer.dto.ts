import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CustomerDto {
  @ApiProperty({
    example: '돌핀맨',
    description: 'customerNickname',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly customerNickname: string;
}
