import { Feedback } from 'src/feedback/entity/feedback.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
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
  Index,
} from 'typeorm';

@Entity('member')
@Index('idx_member_userId', ['user'])
@Index('idx_member_lectureId', ['lecture'])
@Index('idx_member_userId_lectureId', ['user', 'lecture'])
export class Member {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  memberId: number;

  @ManyToOne(() => Users, (user) => user.member)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Lecture, (lecture) => lecture.member)
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  @Column({ type: 'varchar', nullable: true })
  memberNickname: string;

  @CreateDateColumn({ type: 'timestamp' })
  memberCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  memberUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  memberDeletedAt: Date;
}
