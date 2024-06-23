import { Module, forwardRef } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackTarget } from './entity/feedbackTarget.entity';
import { FeedbackTargetRepository } from './feedbackTarget.repository';
import { AwsModule } from 'src/common/aws/aws.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback, FeedbackTarget]),
    AwsModule,
    forwardRef(() => ImageModule),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository, FeedbackTargetRepository],
  exports: [FeedbackService, FeedbackRepository, FeedbackTargetRepository],
})
export class FeedbackModule {}
