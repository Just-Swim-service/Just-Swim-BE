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

@Entity('instructor')
export class Instructor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  instructorId: number;

  @ManyToOne(() => Users, (user) => user.instructor)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  workingLocation: string;

  @Column({ type: 'varchar', nullable: true })
  carrer: string;

  @Column({ type: 'varchar', nullable: true })
  history: string;

  @Column({ type: 'varchar', nullable: true })
  Introduction: string;

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
