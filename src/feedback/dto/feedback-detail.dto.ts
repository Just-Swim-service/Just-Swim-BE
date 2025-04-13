import { InstructorInfoDto } from 'src/instructor/dto/instructor-info.dto';
import { FeedbackInfoDto } from './feedback-info.dto';
import { FeedbackTargetInfoDto } from './feedback-target-info.dto';

export class FeedbackDetailForCustomerDto extends FeedbackInfoDto {
  instructor: InstructorInfoDto;
}

export class FeedbackDetailForInstructorDto extends FeedbackInfoDto {
  feedback: FeedbackDetailForCustomerDto;
  feedbackTargetList: FeedbackTargetInfoDto[];
}
