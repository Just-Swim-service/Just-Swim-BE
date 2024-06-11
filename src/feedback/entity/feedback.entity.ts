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
import { Image } from 'src/image/entity/image.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  feedbackId: number;

  @ManyToOne(() => Users, (user) => user.feedback)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @OneToMany(
    () => FeedbackTarget,
    (feedbackTarget) => feedbackTarget.feedbackId,
  )
  feedbackTarget: FeedbackTarget[];

  @OneToMany(() => Image, (image) => image.feedbackId)
  image: Image[];

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
