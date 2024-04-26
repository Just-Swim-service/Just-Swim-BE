import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Feedback } from './feedback.entity';
import { Users } from 'src/users/entity/users.entity';

@Entity('feedbackTarget')
export class FeedbackTarget {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  feedbackTargetId: number;

  @ManyToOne(() => Feedback, (feedback) => feedback.feedbackTarget)
  @JoinColumn({ name: 'feedbackId' })
  feedbackId: number;

  @ManyToOne(() => Users, (user) => user.feedbackTarget)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  feedbackTargetCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  feedbackTargetUpdatedAt: Date;
}
