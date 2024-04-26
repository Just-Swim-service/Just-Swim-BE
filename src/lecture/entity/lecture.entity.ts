import { Member } from 'src/member/entity/member.entity';
import { Users } from 'src/users/entity/users.entity';
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

  @ManyToOne(() => Users, (user) => user.lecture)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @OneToMany(() => Member, (member) => member.lectureId)
  member: Member[];

  @Column({ type: 'varchar' })
  lectureTitle: string;

  @Column({ type: 'mediumtext' })
  lectureContent: string;

  @Column({ type: 'varchar' })
  lectureTime: string;

  @Column({ type: 'varchar' })
  lectureDays: string;

  @Column({ type: 'varchar' })
  lectureLocation: string;

  @Column({ type: 'varchar' })
  lectureColor: string;

  @Column({ type: 'varchar', nullable: true })
  lectureQRCode: string;

  @Column({ type: 'varchar', nullable: true })
  lectureEndDate: string;

  @CreateDateColumn({ type: 'timestamp' })
  lectureCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  lectureUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  lectureDeletedAt: Date;
}
