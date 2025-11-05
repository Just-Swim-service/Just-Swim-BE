import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('userLevel')
@Index('idx_userLevel_userId', ['user'])
@Index('idx_userLevel_level', ['level'])
@Index('idx_userLevel_experience', ['experience'])
export class UserLevel {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  userLevelId: number;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  experience: number; // 경험치

  @Column({ type: 'int', default: 0 })
  currentStreak: number; // 현재 연속 일수

  @Column({ type: 'int', default: 0 })
  longestStreak: number; // 최장 연속 일수

  @Column({ type: 'timestamp', nullable: true })
  lastActivityDate: Date; // 마지막 활동 날짜

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

