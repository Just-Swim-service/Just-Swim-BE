import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enum/notification-type.enum';
import { NotificationStatus } from '../enum/notification-status.enum';
import { NotificationPriority } from '../enum/notification-priority.enum';

export class NotificationResponseDto {
  @ApiProperty({
    description: '알림 ID',
    example: 1,
  })
  notificationId: number;

  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '알림 타입',
    enum: NotificationType,
    example: NotificationType.Feedback,
  })
  notificationType: NotificationType;

  @ApiProperty({
    description: '알림 상태',
    enum: NotificationStatus,
    example: NotificationStatus.Unread,
  })
  notificationStatus: NotificationStatus;

  @ApiProperty({
    description: '알림 우선순위',
    enum: NotificationPriority,
    example: NotificationPriority.Medium,
  })
  notificationPriority: NotificationPriority;

  @ApiProperty({
    description: '알림 제목',
    example: '새로운 피드백이 도착했습니다.',
  })
  notificationTitle: string;

  @ApiProperty({
    description: '알림 내용',
    example: '김강사님이 새로운 피드백을 작성했습니다.',
  })
  notificationContent: string;

  @ApiProperty({
    description: '알림 링크',
    example: '/feedback/123',
    nullable: true,
  })
  notificationLink: string | null;

  @ApiProperty({
    description: '추가 데이터',
    example: { feedbackId: 123, lectureId: 456 },
    nullable: true,
  })
  notificationData: any;

  @ApiProperty({
    description: '읽은 시간',
    example: '2024-01-01T10:30:00Z',
    nullable: true,
  })
  notificationReadAt: Date | null;

  @ApiProperty({
    description: '예약 발송 시간',
    example: '2024-01-01T10:00:00Z',
    nullable: true,
  })
  notificationScheduledAt: Date | null;

  @ApiProperty({
    description: '생성 시간',
    example: '2024-01-01T10:00:00Z',
  })
  notificationCreatedAt: Date;

  @ApiProperty({
    description: '수정 시간',
    example: '2024-01-01T10:30:00Z',
  })
  notificationUpdatedAt: Date;
}
