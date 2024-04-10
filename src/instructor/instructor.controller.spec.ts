import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorRepository } from './instructor.repository';
import { Instructor } from './entity/instructor.entity';

export class MockInstructorRepository {
  readonly instructor: Instructor[] = [
    {
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
      lectures: []
    },
  ];
}

describe('InstructorController', () => {
  let controller: InstructorController;
  let service: InstructorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
      providers: [
        InstructorService,
        {
          provide: InstructorRepository,
          useClass: MockInstructorRepository,
        },
      ],
    }).compile();

    controller = module.get<InstructorController>(InstructorController);
    service = module.get<InstructorService>(InstructorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
