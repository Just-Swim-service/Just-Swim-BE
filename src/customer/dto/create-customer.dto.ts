import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({
    example: '돌핀맨',
    description: 'customerNickname',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '고객 닉네임은 1-50자 사이여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly customerNickname: string;
}
