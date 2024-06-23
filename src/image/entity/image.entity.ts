import { Feedback } from 'src/feedback/entity/feedback.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('image')
export class Image {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  imageId: number;

  @ManyToOne(() => Feedback, (feedback) => feedback.image)
  @JoinColumn({ name: 'feedbackId' })
  feedbackId: number;

  @Column({ type: 'mediumtext' })
  imagePath: string;

  @CreateDateColumn({ type: 'timestamp' })
  imageCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  imageUpdatedAt: Date;
}
