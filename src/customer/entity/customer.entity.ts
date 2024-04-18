import { Users } from 'src/users/entity/users.entity';
import { Member } from 'src/member/entity/member.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  customerId: number;

  @ManyToOne(() => Users, (user) => user.customer)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @OneToMany(() => Member, member => member.customerId)
  members: Member[];

  @Column({ type: 'varchar', nullable: true })
  customerNickname: string;

  @CreateDateColumn({ type: 'timestamp' })
  customerCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  customerUpdatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  customerDeletedAt: Date;
}
