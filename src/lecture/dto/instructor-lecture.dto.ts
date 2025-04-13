import { MemberInfoDto } from 'src/member/dto/member-info.dto';
import { LectureInfoDto } from './lecture-info.dto';

export class InstructorLectureDto extends LectureInfoDto {
  members: MemberInfoDto[];
}
