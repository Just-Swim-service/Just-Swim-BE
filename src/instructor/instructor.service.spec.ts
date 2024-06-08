import { Test, TestingModule } from '@nestjs/testing';
import { InstructorService } from './instructor.service';
import { InstructorRepository } from './instructor.repository';
import { Instructor } from './entity/instructor.entity';

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

  const mockInstructor = new MockInstructorRepository().mockInstructor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorService,
        {
          provide: InstructorRepository,
          useValue: {
            createInstructor: jest.fn(),
            findInstructorByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InstructorService>(InstructorService);
    repository = module.get<InstructorRepository>(InstructorRepository);
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

  describe('findInstructorByUserId', () => {
    it('userId를 통해 instructor 정보를 조회', async () => {
      const userId = 1;
      (repository.findInstructorByUserId as jest.Mock).mockResolvedValue(
        mockInstructor,
      );

      const result = await service.findInstructorByUserId(userId);

      expect(result).toEqual(mockInstructor);
    });
  });
});
