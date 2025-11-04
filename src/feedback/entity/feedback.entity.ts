import { Users } from 'src/users/entity/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FeedbackTarget } from './feedback-target.entity';
import { Image } from 'src/image/entity/image.entity';
import { FeedbackType } from '../enum/feedback-type.enum';

@Entity('feedback')
@Index('idx_feedback_userId', ['user'])
@Index('idx_feedback_feedbackDate', ['feedbackDate'])
@Index('idx_feedback_feedbackType', ['feedbackType'])
@Index('idx_feedback_userId_feedbackDate', ['user', 'feedbackDate'])
export class Feedback {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  feedbackId: number;

  @ManyToOne(() => Users, (user) => user.feedback)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => FeedbackTarget, (feedbackTarget) => feedbackTarget.feedback)
  feedbackTarget: FeedbackTarget[];

  @OneToMany(() => Image, (image) => image.feedback)
  image: Image[];

  @Column({ type: 'enum', enum: FeedbackType })
  feedbackType: FeedbackType;

  @Column({ type: 'varchar' })
  feedbackDate: string;

  @Column({ type: 'mediumtext', nullable: true })
  feedbackLink: string;

  @Column({ type: 'mediumtext' })
  feedbackContent: string;

  @CreateDateColumn({ type: 'timestamp' })
  feedbackCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  feedbackUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  feedbackDeletedAt: Date;
}
