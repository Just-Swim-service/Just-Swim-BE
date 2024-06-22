import { Customer } from 'src/customer/entity/customer.entity';
import { Feedback } from 'src/feedback/entity/feedback.entity';
import { FeedbackTarget } from 'src/feedback/entity/feedbackTarget.entity';
import { Instructor } from 'src/instructor/entity/instructor.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Member } from 'src/member/entity/member.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  userType: string;

  @Column({ type: 'varchar' })
  provider: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage: string;

  @Column({ type: 'varchar', nullable: true })
  birth: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @CreateDateColumn({ type: 'timestamp' })
  userCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  userUpdatedAt: Date;

  @OneToMany(() => Customer, (customer) => customer.user)
  customer: Customer[];

  @OneToMany(() => Instructor, (instructor) => instructor.user)
  instructor: Instructor[];

  @OneToMany(() => Member, (member) => member.user)
  member: Member[];

  @OneToMany(() => Lecture, (lecture) => lecture.user)
  lecture: Lecture[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedback: Feedback[];

  @OneToMany(() => FeedbackTarget, (feedbackTarget) => feedbackTarget.user)
  feedbackTarget: FeedbackTarget[];
}
