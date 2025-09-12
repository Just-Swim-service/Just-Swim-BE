import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsDateString,
} from 'class-validator';
import { NotificationType } from '../enum/notification-type.enum';
import { NotificationPriority } from '../enum/notification-priority.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: '알림을 받을 사용자 ID',
    example: 1,
  })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: '알림 타입',
    enum: NotificationType,
    example: NotificationType.Feedback,
  })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiProperty({
    description: '알림 제목',
    example: '새로운 피드백이 도착했습니다.',
  })
  @IsString()
  @IsNotEmpty()
  notificationTitle: string;

  @ApiProperty({
    description: '알림 내용',
    example: '김강사님이 새로운 피드백을 작성했습니다.',
  })
  @IsString()
  @IsNotEmpty()
  notificationContent: string;

  @ApiProperty({
    description: '알림 링크 (선택사항)',
    example: '/feedback/123',
    required: false,
  })
  @IsString()
  @IsOptional()
  notificationLink?: string;

  @ApiProperty({
    description: '알림 우선순위',
    enum: NotificationPriority,
    example: NotificationPriority.Medium,
    required: false,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  notificationPriority?: NotificationPriority;

  @ApiProperty({
    description: '추가 데이터 (JSON 형태)',
    example: { feedbackId: 123, lectureId: 456 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  notificationData?: any;

  @ApiProperty({
    description: '예약 발송 시간 (ISO 8601 형식)',
    example: '2024-01-01T10:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  notificationScheduledAt?: string;
}
