import { Users } from 'src/users/entity/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType } from '../enum/notification-type.enum';
import { NotificationStatus } from '../enum/notification-status.enum';
import { NotificationPriority } from '../enum/notification-priority.enum';

@Entity('notification')
@Index('idx_notification_userId', ['user'])
@Index('idx_notification_status', ['notificationStatus'])
@Index('idx_notification_createdAt', ['notificationCreatedAt'])
@Index('idx_notification_userId_status', ['user', 'notificationStatus'])
export class Notification {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  notificationId: number;

  @ManyToOne(() => Users, (user) => user.notification)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.Unread,
  })
  notificationStatus: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.Medium,
  })
  notificationPriority: NotificationPriority;

  @Column({ type: 'varchar', length: 255 })
  notificationTitle: string;

  @Column({ type: 'mediumtext' })
  notificationContent: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notificationLink: string;

  @Column({ type: 'json', nullable: true })
  notificationData: any;

  @Column({ type: 'timestamp', nullable: true })
  notificationReadAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  notificationScheduledAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  notificationCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  notificationUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  notificationDeletedAt: Date;
}
