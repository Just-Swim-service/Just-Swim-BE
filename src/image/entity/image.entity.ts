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
  feedback: Feedback;

  @Column({ type: 'mediumtext' })
  imagePath: string;

  @Column({ type: 'varchar', nullable: true })
  fileType: string; // 'image' 또는 'video'

  @Column({ type: 'varchar', nullable: true })
  fileName: string; // 원본 파일명

  @Column({ type: 'int', nullable: true })
  fileSize: number; // 파일 크기 (bytes)

  @Column({ type: 'varchar', nullable: true })
  duration: string; // 동영상 길이 (초)

  @Column({ type: 'varchar', nullable: true })
  thumbnailPath: string; // 동영상 썸네일 경로

  @CreateDateColumn({ type: 'timestamp' })
  imageCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  imageUpdatedAt: Date;
}
