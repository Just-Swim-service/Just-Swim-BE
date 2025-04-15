import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Instructor } from './entity/instructor.entity';
import { InstructorRepository } from './instructor.repository';

@Injectable()
export class InstructorService {
  constructor(private readonly instructorRepository: InstructorRepository) {}

  /* instructor의 정보 조회 */
  async findInstructorByUserId(userId: number): Promise<Instructor> {
    const instructor =
      await this.instructorRepository.findInstructorByUserId(userId);

    if (!instructor) {
      throw new NotFoundException(
        '해당 사용자의 instructor 정보를 찾을 수 없습니다.',
      );
    }
    return instructor;
  }

  /* userType을 instructor로 지정할 경우 instructor 정보 생성 */
  async createInstructor(userId: number): Promise<Instructor> {
    const exists =
      await this.instructorRepository.findInstructorByUserId(userId);
    if (exists) {
      throw new ConflictException('이미 해당 instructor 정보가 존재합니다.');
    }
    return await this.instructorRepository.createInstructor(userId);
  }
}
