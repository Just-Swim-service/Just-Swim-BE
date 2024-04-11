import { Users } from 'src/users/entity/users.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
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

@Entity('instructor')
export class Instructor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  instructorId: number;

  @ManyToOne(() => Users, (user) => user.instructor)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @OneToMany(() => Lecture, (lecture) => lecture.instructor)
  lectures: Lecture[];

  @Column({ type: 'varchar', nullable: true })
  workingLocation: string;

  @Column({ type: 'varchar', nullable: true })
  career: string;

  @Column({ type: 'varchar', nullable: true })
  history: string;

  @Column({ type: 'varchar', nullable: true })
  introduction: string;

  @Column({ type: 'mediumtext', nullable: true })
  curriculum: string;

  @Column({ type: 'varchar', nullable: true })
  youtubeLink: string;

  @Column({ type: 'varchar', nullable: true })
  instagramLink: string;

  @Column({ type: 'varchar', nullable: true })
  facebookLink: string;

  @CreateDateColumn({ type: 'timestamp' })
  instructorCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  instructorUpdatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  instructorDeletedAt: Date;
}
