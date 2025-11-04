import { Feedback } from 'src/feedback/entity/feedback.entity';
import { Community } from 'src/community/entity/community.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('image')
@Index('idx_image_feedbackId', ['feedback'])
@Index('idx_image_communityId', ['community'])
export class Image {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  imageId: number;

  @ManyToOne(() => Feedback, (feedback) => feedback.image, { nullable: true })
  @JoinColumn({ name: 'feedbackId' })
  feedback: Feedback;

  @ManyToOne(() => Community, (community) => community.images, {
    nullable: true,
  })
  @JoinColumn({ name: 'communityId' })
  community: Community;

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
