import { InstructorInfoDto } from 'src/instructor/dto/instructor-info.dto';
import { FeedbackInfoDto } from './feedback-info.dto';
import { FeedbackTargetInfoDto } from './feedback-target-info.dto';

export class FeedbackDetailInfo extends FeedbackInfoDto {
  instructor: InstructorInfoDto;
}

export class FeedbackDetail {
  feedback: FeedbackDetailInfo;
  feedbackTargetList?: FeedbackTargetInfoDto[];
}
