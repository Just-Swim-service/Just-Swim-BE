import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instructor } from './entity/instructor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InstructorRepository {
  constructor(
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
  ) {}

  /* userType을 instructor로 지정할 경우 instructor 정보 생성 */
  async createInstructor(userId: number): Promise<Instructor> {
    const result = await this.instructorRepository.query(
      `CALL CREATE_INSTRUCTOR(?)`,
      [userId],
    );
    return result;
  }

  /* instructor의 정보 조회 */
  async findInstructorByUserId(userId: number): Promise<Instructor> {
    return await this.instructorRepository.query(
      `CALL FIND_INSTRUCTOR_BY_USERID(?)`,
      [userId],
    );
  }
}
