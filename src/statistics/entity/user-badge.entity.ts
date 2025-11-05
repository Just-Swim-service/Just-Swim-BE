import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { BadgeType } from '../enum/badge-type.enum';

@Entity('userBadge')
@Index('idx_userBadge_userId', ['user'])
@Index('idx_userBadge_badgeType', ['badgeType'])
export class UserBadge {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  userBadgeId: number;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'enum', enum: BadgeType })
  badgeType: BadgeType;

  @Column({ type: 'varchar', nullable: true })
  badgeDescription: string;

  @CreateDateColumn({ type: 'timestamp' })
  earnedAt: Date;
}

