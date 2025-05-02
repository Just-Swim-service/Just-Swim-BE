import { Test, TestingModule } from '@nestjs/testing';
import { InstructorRepository } from './instructor.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entity/instructor.entity';

describe('InstructorRepository', () => {
  let instructorRepository: InstructorRepository;
  let repo: jest.Mocked<Repository<Instructor>>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorRepository,
        {
          provide: getRepositoryToken(Instructor),
          useValue: mockRepo,
        },
      ],
    }).compile();

    instructorRepository =
      module.get<InstructorRepository>(InstructorRepository);
    repo = module.get(getRepositoryToken(Instructor));
  });

  it('should create instructor for given userId', async () => {
    const createdInstructor = {
      instructorId: 1,
      user: { userId: 1 },
    } as Instructor;
    repo.create.mockReturnValue(createdInstructor);
    repo.save.mockResolvedValue(createdInstructor);

    const result = await instructorRepository.createInstructor(1);
    expect(repo.create).toHaveBeenCalledWith({ user: { userId: 1 } });
    expect(repo.save).toHaveBeenCalledWith(createdInstructor);
    expect(result).toEqual(createdInstructor);
  });

  it('should find instructor by userId', async () => {
    const foundInstructor = {
      instructorId: 1,
      user: { userId: 1 },
    } as Instructor;
    repo.findOne.mockResolvedValue(foundInstructor);

    const result = await instructorRepository.findInstructorByUserId(1);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { user: { userId: 1 } },
    });
    expect(result).toEqual(foundInstructor);
  });
});
