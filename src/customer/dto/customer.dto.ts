import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CustomerDto {
  @ApiProperty({
    example: '돌핀맨',
    description: 'nickName',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly nickName: string;
}
