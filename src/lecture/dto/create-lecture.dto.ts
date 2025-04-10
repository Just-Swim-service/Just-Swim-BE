import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLectureDto {
  @ApiProperty({
    example: '아침 5반',
    description: '강의 제목',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly lectureTitle: string;

  @ApiProperty({
    example: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
    description: '강의 정보',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly lectureContent: string;

  @ApiProperty({
    example: '12:00-14:00',
    description: '강의 시간',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly lectureTime: string;

  @ApiProperty({
    example: '화목',
    description: '강의 요일',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly lectureDays: string;

  @ApiProperty({
    example: '강동구 실내 수영장',
    description: '강의 위치',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly lectureLocation: string;

  @ApiProperty({
    example: '#F1554C',
    description: '강의 고유 색',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly lectureColor: string;

  @ApiProperty({
    example: 'QR 코드',
    description: 'QR 코드 정보',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureQRCode: string;

  @ApiProperty({
    example: '2024.05.31',
    description: '강의 종료 날짜',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lectureEndDate: string;
}
