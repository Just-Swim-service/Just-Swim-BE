import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationListDto {
  @ApiProperty({
    description: '알림 목록',
    type: [NotificationResponseDto],
  })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: '전체 알림 수',
    example: 25,
  })
  totalCount: number;

  @ApiProperty({
    description: '읽지 않은 알림 수',
    example: 5,
  })
  unreadCount: number;

  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: '총 페이지 수',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  pageSize: number;
}
