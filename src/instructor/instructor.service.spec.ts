import { Test, TestingModule } from '@nestjs/testing';
import { InstructorService } from './instructor.service';
import { InstructorRepository } from './instructor.repository';
import { Instructor } from './entity/instructor.entity';
import { MyLogger } from 'src/common/logger/logger.service';

export class MockInstructorRepository {
  readonly mockInstructor: Instructor = {
    instructorId: 1,
    userId: 3,
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
    instructorDeletedAt: null,
  };
}

describe('InstructorService', () => {
  let service: InstructorService;
  let repository: InstructorRepository;
  let logger: MyLogger;

  const mockInstructor = new MockInstructorRepository().mockInstructor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorService,
        {
          provide: InstructorRepository,
          useValue: {
            createInstructor: jest.fn(),
          },
        },
        {
          provide: MyLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InstructorService>(InstructorService);
    repository = module.get<InstructorRepository>(InstructorRepository);
    logger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInsturctor', () => {
    it('should create a new instructor with the provided data', async () => {
      const instructorData = { userId: 3 };
      const newInstructor: Instructor = {
        instructorId: 1,
        ...instructorData,
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
        instructorDeletedAt: null,
      };
      (repository.createInstructor as jest.Mock).mockResolvedValue(
        newInstructor,
      );

      const result = await service.createInstructor(instructorData.userId);

      expect(result).toEqual(newInstructor);
    });
  });
});
