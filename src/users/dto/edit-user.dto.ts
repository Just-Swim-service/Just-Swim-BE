import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class EditUserDto {
  @ApiProperty({
    example: '홍길동',
    description: '수정할 사용자 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '이름은 1-50자 사이여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly name?: string;

  @ApiProperty({
    example: 'URL',
    description: '수정할 사용자 프로필 이미지',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '프로필 이미지 URL은 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  profileImage?: string;

  @ApiProperty({
    example: '1995.09.13',
    description: '수정할 사용자 생년월일',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}\.\d{2}\.\d{2}$/, {
    message: '생년월일은 YYYY.MM.DD 형식이어야 합니다.',
  })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly birth?: string;

  @ApiProperty({
    example: '010-1234-1234',
    description: '수정할 사용자 핸드폰 번호',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '핸드폰 번호는 010-XXXX-XXXX 형식이어야 합니다.',
  })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly phoneNumber?: string;

  // Instructor 관련 필드
  @ApiProperty({
    example: '서울시 강남구',
    description: '강사 근무지',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: '근무지는 200자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly instructorWorkingLocation?: string;

  @ApiProperty({
    example: '10년 경력',
    description: '강사 경력',
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
  readonly instructorCareer?: string;

  @ApiProperty({
    example: '자유형 전문 강사',
    description: '강사 이력',
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
  readonly instructorHistory?: string;

  @ApiProperty({
    example: '10년 경력의 수영 강사입니다.',
    description: '강사 소개',
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
  readonly instructorIntroduction?: string;

  @ApiProperty({
    example: '기초부터 고급까지 체계적인 커리큘럼',
    description: '강사 커리큘럼',
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
  readonly instructorCurriculum?: string;

  @ApiProperty({
    example: 'https://youtube.com/channel/example',
    description: '강사 유튜브 링크',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '유튜브 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly instructorYoutubeLink?: string;

  @ApiProperty({
    example: 'https://instagram.com/example',
    description: '강사 인스타그램 링크',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '인스타그램 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly instructorInstagramLink?: string;

  @ApiProperty({
    example: 'https://facebook.com/example',
    description: '강사 페이스북 링크',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '페이스북 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly instructorFacebookLink?: string;

  // Customer 관련 필드
  @ApiProperty({
    example: '수영초보',
    description: '고객 닉네임',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50, { message: '닉네임은 50자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  readonly customerNickname?: string;
}
