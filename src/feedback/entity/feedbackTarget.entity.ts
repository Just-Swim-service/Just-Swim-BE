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
import { Lecture } from 'src/lecture/entity/lecture.entity';

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

  @ManyToOne(() => Lecture, (lecture) => lecture.feedbackTarget)
  @JoinColumn({ name: 'lectureId' })
  lectureId: number;

  @CreateDateColumn({ type: 'timestamp' })
  feedbackTargetCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  feedbackTargetUpdatedAt: Date;
}
