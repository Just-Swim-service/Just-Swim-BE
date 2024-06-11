import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsNotEmpty()
  readonly file: any;
}
