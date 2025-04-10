import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWithdrawalReasonDto {
  @ApiProperty({
    example: '기능이 유용하지 않아요',
    description: '탈퇴 사유',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly withdrawalReasonContent: string;
}
