import { ApiProperty } from '@nestjs/swagger';

export class InstructorDto {
  @ApiProperty({
    example: '경기도 일산',
    description: 'workingLocation',
    required: false,
  })
  readonly workingLocation: string;

  @ApiProperty({
    example: '생활체육지도자 자격증 2급',
    description: 'carrer',
    required: false,
  })
  readonly carrer: string;

  @ApiProperty({
    example: '일산올림픽스포츠센터 2019-2022',
    description: 'history',
    required: false,
  })
  readonly history: string;

  @ApiProperty({
    example: '일산에 활동 중인 수영강사 돌핀맨입니다.',
    description: 'Introduction',
    required: false,
  })
  readonly Introduction: string;

  @ApiProperty({
    example: '초급반 - 자유형, 배영 / 중급반 - 평영 / 상급반 - 접영',
    description: 'curriculum',
    required: false,
  })
  readonly curriculum: string;

  @ApiProperty({
    example: '유튜브 링크',
    description: 'youtubeLink',
    required: false,
  })
  readonly youtubeLink: string;

  @ApiProperty({
    example: '인스타그램 링크',
    description: 'instagramLink',
    required: false,
  })
  readonly instagramLink: string;

  @ApiProperty({
    example: '페이스북 링크',
    description: 'facebookLink',
    required: false,
  })
  readonly facebookLink: string;
}
