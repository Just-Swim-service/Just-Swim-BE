import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditLectureDto {
  @ApiProperty({
    example: '아침 3반',
    description: '강의 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureTitle: string;

  @ApiProperty({
    example: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
    description: '수정할 강의 정보',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureContent: string;

  @ApiProperty({
    example: '12:00-14:00',
    description: '수정할 강의 시간',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureTime: string;

  @ApiProperty({
    example: '화목',
    description: '수정할 강의 요일',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureDays: string;

  @ApiProperty({
    example: '고양체육관',
    description: '수정할 강의 위치',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureLocation: string;

  @ApiProperty({
    example: '#F1547C',
    description: '수정할 강의 고유 색',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureColor: string;

  @ApiProperty({
    example: 'QR 코드',
    description: '수정할 QR 코드 정보',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureQRCode: string;

  @ApiProperty({
    example: '2024.05.31',
    description: '수정할 강의 종료 날짜',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureEndDate: string;
}
