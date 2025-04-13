import { FeedbackInfoDto } from 'src/feedback/dto/feedback-info.dto';
import { LectureInfoDto } from 'src/lecture/dto/lecture-info.dto';

export class MemberInfoDto {
  userId: number;
  profileImage: string | null;
  name: string;
  birth?: string;
  email?: string;
  phoneNumber?: string;
  lectures?: LectureInfoDto[];
  feedback?: FeedbackInfoDto[];
}
