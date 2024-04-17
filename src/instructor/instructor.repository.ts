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

  async createInstructor(userId: number): Promise<Instructor> {
    const instructor = new Instructor();
    instructor.userId = userId;
    await this.instructorRepository.save(instructor);
    return instructor;
  }

  async findInstructor(userId: number): Promise<Instructor> {
    return await this.instructorRepository
      .createQueryBuilder('instructor')
      .select([
        'instructorId',
        'userId',
        'workingLocation',
        'career',
        'history',
        'introduction',
        'curriculum',
        'youtubeLink',
        'instagramLink',
        'facebookLink',
      ])
      .where('instructor.userId = :userId', { userId })
      .getRawOne();
  }
}
