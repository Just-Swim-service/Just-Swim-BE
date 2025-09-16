import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationStatsController } from './notification-stats.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { NotificationRepository } from './notification.repository';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => UsersModule),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationController, NotificationStatsController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
