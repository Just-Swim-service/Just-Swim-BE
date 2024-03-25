import { Injectable } from '@nestjs/common';
import { Instructor } from './entity/instructor.entity';
import { InstructorRepository } from './instructor.repository';

@Injectable()
export class InstructorService {
  constructor(private readonly instructorRepository: InstructorRepository) {}

  async createInstructor(userId: number): Promise<Instructor> {
    return await this.instructorRepository.createInstructor(userId);
  }
}
