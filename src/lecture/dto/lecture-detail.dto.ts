import { InstructorInfoDto } from 'src/instructor/dto/instructor-info.dto';
import { LectureInfoDto } from './lecture-info.dto';
import { MemberInfoDto } from 'src/member/dto/member-info.dto';

export class LectureDetailDto extends LectureInfoDto {
  instructor: InstructorInfoDto;
  members: MemberInfoDto[];
}
