import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Users } from 'src/users/entity/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  memberId: number;

  @ManyToOne(() => Users, (user) => user.member)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @ManyToOne(() => Lecture, (lecture) => lecture.members)
  @JoinColumn({ name: 'lectureId' })
  lectureId: number;

  @Column({ type: 'varchar', nullable: true })
  memberNickname: string;

  @CreateDateColumn({ type: 'timestamp' })
  memberCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  memberUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  memberDeletedAt: Date;
}
