import { Injectable } from '@nestjs/common';
import { Instructor } from './entity/instructor.entity';
import { InstructorRepository } from './instructor.repository';

@Injectable()
export class InstructorService {
  constructor(private readonly instructorRepository: InstructorRepository) {}

  async createInstructor(userId: number): Promise<Instructor> {
    try {
      return await this.instructorRepository.createInstructor(userId);
    } catch (error) {
      throw new Error('강사 프로필 생성 중에 오류가 발생했습니다.');
    }
  }

  async findInstructor(userId: number): Promise<Instructor> {
    try {
      return await this.instructorRepository.findInstructor(userId);
    } catch (error) {
      throw new Error('강사 프로필 조회 중 오류가 발생했습니다.');
    }
  }
}
