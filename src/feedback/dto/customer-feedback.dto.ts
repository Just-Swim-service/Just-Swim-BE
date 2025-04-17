import { InstructorInfoDto } from 'src/instructor/dto/instructor-info.dto';
import { FeedbackInfoDto } from './feedback-info.dto';

export class CustomerFeedbackDto extends FeedbackInfoDto {
  lectureTitle: string;
  lectureColor: string;
  instructor: InstructorInfoDto;
}
