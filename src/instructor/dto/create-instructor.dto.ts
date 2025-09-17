import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInstructorDto {
  @ApiProperty({
    example: '경기도 일산',
    description: 'workingLocation',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: '근무 지역은 200자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly workingLocation: string;

  @ApiProperty({
    example: '생활체육지도자 자격증 2급',
    description: 'career',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '경력은 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly career: string;

  @ApiProperty({
    example: '일산올림픽스포츠센터 2019-2022',
    description: 'history',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: '이력은 1000자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly history: string;

  @ApiProperty({
    example: '일산에 활동 중인 수영강사 돌핀맨입니다.',
    description: 'Introduction',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: '소개는 1000자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly Introduction: string;

  @ApiProperty({
    example: '초급반 - 자유형, 배영 / 중급반 - 평영 / 상급반 - 접영',
    description: 'curriculum',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: '커리큘럼은 1000자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly curriculum: string;

  @ApiProperty({
    example: '유튜브 링크',
    description: 'youtubeLink',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '유효한 URL 형식이어야 합니다.' })
  @Length(0, 500, { message: '유튜브 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly youtubeLink: string;

  @ApiProperty({
    example: '인스타그램 링크',
    description: 'instagramLink',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '유효한 URL 형식이어야 합니다.' })
  @Length(0, 500, { message: '인스타그램 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly instagramLink: string;

  @ApiProperty({
    example: '페이스북 링크',
    description: 'facebookLink',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '유효한 URL 형식이어야 합니다.' })
  @Length(0, 500, { message: '페이스북 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly facebookLink: string;
}
