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
} from 'typeorm';
import { FeedbackTarget } from './feedbackTarget.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  feedbackId: number;

  @ManyToOne(() => Users, (user) => user.feedback, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: Users | null;

  @OneToMany(() => FeedbackTarget, (feedbackTarget) => feedbackTarget.feedback)
  feedbackTarget: FeedbackTarget[];

  @Column({ type: 'varchar' })
  feedbackType: string;

  @Column({ type: 'varchar' })
  feedbackDate: string;

  @Column({ type: 'mediumtext', nullable: true })
  feedbackFile: string;

  @Column({ type: 'mediumtext', nullable: true })
  feedbackLink: string;

  @Column({ type: 'mediumtext' })
  feedbackContent: string;

  @Column({ type: 'varchar' })
  feedbackTargetList: string;

  @CreateDateColumn({ type: 'timestamp' })
  feedbackCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  feedbackUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  feedbackDeletedAt: Date;
}
