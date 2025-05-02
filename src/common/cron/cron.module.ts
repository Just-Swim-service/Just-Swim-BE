import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Lecture])],
  providers: [CronService],
})
export class CronModule {}
