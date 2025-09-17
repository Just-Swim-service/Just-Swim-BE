import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
  IsDateString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
  @Length(1, 200, { message: '알림 제목은 1-200자 사이여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  notificationTitle?: string;

  @ApiProperty({
    description: '알림 내용',
    example: '수정된 알림 내용',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 1000, { message: '알림 내용은 1-1000자 사이여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
  notificationContent?: string;

  @ApiProperty({
    description: '알림 링크',
    example: '/feedback/456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: '알림 링크는 500자 이하여야 합니다.' })
  @Transform(({ value }) => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  })
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
