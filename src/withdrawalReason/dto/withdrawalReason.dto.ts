import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WithdrawalReasonDto {
  @ApiProperty({
    example: '기능이 유용하지 않아요',
    description: '탈퇴 사유',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly withdrawalReasonContent: string;
}
