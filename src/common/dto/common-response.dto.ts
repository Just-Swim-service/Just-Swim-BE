import { ApiProperty } from '@nestjs/swagger';

export class CommonResponseDto<T = any> {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: '에러 정보 (실패 시)',
    required: false,
  })
  errors?: any;
}

export class PaginationMetaDto {
  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '이전 페이지 존재 여부',
    example: false,
  })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T = any> extends CommonResponseDto<T[]> {
  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: '에러 메시지',
    example: '요청 처리 중 오류가 발생했습니다.',
  })
  message: string;

  @ApiProperty({
    description: '에러 코드',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  errorCode?: string;

  @ApiProperty({
    description: '상세 에러 정보',
    required: false,
  })
  errors?: any;

  @ApiProperty({
    description: '에러 발생 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: '요청 경로',
    example: '/api/users',
  })
  path: string;
}
