import { Users } from 'src/users/entity/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('withdrawalReason')
export class WithdrawalReason {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  withdrawalReasonId: number;

  @ManyToOne(() => Users, (user) => user.withdrawalReason)
  user: Users;

  @Column({ type: 'varchar', nullable: true })
  withdrawalReasonContent: string;

  @CreateDateColumn({ type: 'timestamp' })
  withdrawalReasonCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  withdrawalReasonUpdatedAt: Date;
}
