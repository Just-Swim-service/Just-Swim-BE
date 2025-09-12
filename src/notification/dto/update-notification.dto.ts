import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
  IsDateString,
} from 'class-validator';
import { NotificationStatus } from '../enum/notification-status.enum';
import { NotificationPriority } from '../enum/notification-priority.enum';

export class UpdateNotificationDto {
  @ApiProperty({
    description: '알림 상태',
    enum: NotificationStatus,
    example: NotificationStatus.Read,
    required: false,
  })
  @IsEnum(NotificationStatus)
  @IsOptional()
  notificationStatus?: NotificationStatus;

  @ApiProperty({
    description: '알림 우선순위',
    enum: NotificationPriority,
    example: NotificationPriority.High,
    required: false,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  notificationPriority?: NotificationPriority;

  @ApiProperty({
    description: '알림 제목',
    example: '수정된 알림 제목',
    required: false,
  })
  @IsString()
  @IsOptional()
  notificationTitle?: string;

  @ApiProperty({
    description: '알림 내용',
    example: '수정된 알림 내용',
    required: false,
  })
  @IsString()
  @IsOptional()
  notificationContent?: string;

  @ApiProperty({
    description: '알림 링크',
    example: '/feedback/456',
    required: false,
  })
  @IsString()
  @IsOptional()
  notificationLink?: string;

  @ApiProperty({
    description: '추가 데이터 (JSON 형태)',
    example: { feedbackId: 456, lectureId: 789 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  notificationData?: any;

  @ApiProperty({
    description: '예약 발송 시간 (ISO 8601 형식)',
    example: '2024-01-01T15:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  notificationScheduledAt?: string;
}
