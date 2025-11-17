import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Lecture } from './lecture.entity';

@Entity('lecture_qr_token')
@Index('idx_lecture_qr_token_lectureId', ['lecture'])
@Index('idx_lecture_qr_token_token', ['token'], { unique: true })
export class LectureQrToken {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  tokenId: number;

  @ManyToOne(() => Lecture, (lecture) => lecture.lectureId)
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  tokenCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  tokenUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  tokenDeletedAt: Date;
}

