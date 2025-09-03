import { Module, forwardRef } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackTarget } from './entity/feedback-target.entity';
import { FeedbackTargetRepository } from './feedback-target.repository';
import { AwsModule } from 'src/common/aws/aws.module';
import { ImageModule } from 'src/image/image.module';
import { UsersModule } from 'src/users/users.module';
import { FeedbackAccessGuard } from 'src/auth/guard/feedback-access.guard';
import { UserTypeGuard } from 'src/auth/guard/user-type.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback, FeedbackTarget]),
    AwsModule,
    forwardRef(() => ImageModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    FeedbackRepository,
    FeedbackTargetRepository,
    FeedbackAccessGuard,
    UserTypeGuard,
  ],
  exports: [FeedbackService, FeedbackRepository, FeedbackTargetRepository],
})
export class FeedbackModule {}
