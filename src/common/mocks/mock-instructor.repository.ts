import { Instructor } from 'src/instructor/entity/instructor.entity';
import { mockUser } from './mock-user.repository';

export const mockInstructor: Instructor = {
  instructorId: 1,
  user: mockUser,
  workingLocation: null,
  career: null,
  history: null,
  introduction: null,
  curriculum: null,
  youtubeLink: null,
  instagramLink: null,
  facebookLink: null,
  instructorCreatedAt: new Date(),
  instructorUpdatedAt: new Date(),
};

export const MockInstructorRepository = {
  createInstructor: jest.fn(),
  findInstructorByUserId: jest.fn(),
};
