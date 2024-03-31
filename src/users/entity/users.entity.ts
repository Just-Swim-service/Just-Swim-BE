import { Customer } from 'src/customer/entity/customer.entity';
import { Instructor } from 'src/instructor/entity/instructor.entity';
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

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  userDeletedAt: Date;

  @OneToMany(() => Customer, (customer) => customer.userId)
  customer: Customer[];

  @OneToMany(() => Instructor, (instructor) => instructor.userId)
  instructor: Instructor[];
}
