import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWithdrawalReasonDto {
  @ApiProperty({
    example: '기능이 유용하지 않아요',
    description: '탈퇴 사유',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '탈퇴 사유는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly withdrawalReasonContent: string;
}
