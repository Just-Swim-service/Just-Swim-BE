import { Instructor } from 'src/instructor/entity/instructor.entity';
import { Member } from 'src/member/entity/member.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('lecture')
export class Lecture {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  lectureId: number;

  @ManyToOne(() => Instructor, (instructor) => instructor.lectures)
  @JoinColumn({ name: 'instructorId' })
  instructor: Instructor;

  @OneToMany(() => Member, member => member.lectureId)
  members: Member[];

  @Column({ type: 'varchar' })
  lectureTime: string;

  @Column({ type: 'varchar' })
  lectureDays: string;

  @Column({ type: 'varchar' })
  lectureLevel: string;

  @Column({ type: 'mediumtext' })
  lectureContent: string;

  @Column({ type: 'varchar', nullable: true })
  lectureQRCode: string;

  @CreateDateColumn({ type: 'timestamp' })
  lectureCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  lectureUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  lectureDeletedAt: Date;
}
