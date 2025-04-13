import { FeedbackInfoDto } from './feedback-info.dto';
import { FeedbackTargetInfoDto } from './feedback-target-info.dto';

export class InstructorFeedbackDto extends FeedbackInfoDto {
  lectureTitle: string;
  members: FeedbackTargetInfoDto[];
}
