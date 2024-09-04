import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalReason } from './entity/withdrawal-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawalReason])],
})
export class WithdrawalReasonModule {}
