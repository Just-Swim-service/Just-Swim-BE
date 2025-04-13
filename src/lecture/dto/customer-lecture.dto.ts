import { InstructorInfoDto } from 'src/instructor/dto/instructor-info.dto';
import { LectureInfoDto } from './lecture-info.dto';

export class CustomerLectureDto extends LectureInfoDto {
  instructor: InstructorInfoDto;
}
