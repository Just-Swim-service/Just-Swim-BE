import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsHexColor,
  IsEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Sanitize } from 'src/common/security/sanitization.util';

export class CreateLectureDto {
  @ApiProperty({
    example: '아침 5반',
    description: '강의 제목',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100, { message: '강의 제목은 1-100자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  @Sanitize()
  readonly lectureTitle: string;

  @ApiProperty({
    example: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
    description: '강의 정보',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 1000, { message: '강의 내용은 1-1000자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  @Sanitize()
  readonly lectureContent: string;

  @ApiProperty({
    example: '12:00-14:00',
    description: '강의 시간',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    {
      message: '강의 시간은 HH:MM-HH:MM 형식이어야 합니다.',
    },
  )
  @Transform(({ value }) => value?.trim())
  readonly lectureTime: string;

  @ApiProperty({
    example: '화목',
    description: '강의 요일',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[월화수목금토일]+$/, {
    message: '강의 요일은 월화수목금토일만 포함할 수 있습니다.',
  })
  @Transform(({ value }) => value?.trim())
  readonly lectureDays: string;

  @ApiProperty({
    example: '강동구 실내 수영장',
    description: '강의 위치',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200, { message: '강의 위치는 1-200자 사이여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  @Sanitize()
  readonly lectureLocation: string;

  @ApiProperty({
    example: '#F1554C',
    description: '강의 고유 색',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsHexColor({ message: '유효한 헥스 색상 코드여야 합니다.' })
  @Transform(({ value }) => value?.trim())
  readonly lectureColor: string;

  @ApiProperty({
    example: 'QR 코드',
    description: 'QR 코드 정보',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'QR 코드 정보는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly lectureQRCode: string;

  @ApiProperty({
    example: '2024.05.31',
    description: '강의 종료 날짜',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}\.\d{2}\.\d{2}$/, {
    message: '강의 종료 날짜는 YYYY.MM.DD 형식이어야 합니다.',
  })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly lectureEndDate: string;
}
