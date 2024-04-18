import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Customer } from 'src/customer/entity/customer.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Users } from 'src/users/entity/users.entity';


@Entity('member')
export class Member {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  memberId: number;

  @ManyToOne(() => Customer, (customer) => customer.members)
  @JoinColumn({ name: 'customerId' })
  customerId: number;

  @ManyToOne(() => Lecture, (lecture) => lecture.members)
  @JoinColumn({ name: 'lectureId' })
  lectureId: number;

  @ManyToOne(() => Users, (user) => user.customer)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  memberNickname: string;

  @CreateDateColumn({ type: 'timestamp' })
  memberCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  memberUpdatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  memberDeletedAt: Date;
}
