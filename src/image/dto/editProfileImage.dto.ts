import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { EditUserDto } from 'src/users/dto/editUser.dto';

export class EditProfileImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '수정할 사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  readonly profileImage?: string;

  @ApiProperty({
    description: '프로필 수정 데이터',
    type: EditUserDto,
  })
  editUserDto: EditUserDto;
}
