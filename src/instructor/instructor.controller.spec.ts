import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';

class MockInstructorService {
  createInstructor = jest.fn();
  findInstructorByUserId = jest.fn();
}

describe('InstructorController', () => {
  let controller: InstructorController;
  let service: InstructorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
      providers: [
        { provide: InstructorService, useClass: MockInstructorService },
      ],
    }).compile();

    controller = module.get<InstructorController>(InstructorController);
    service = module.get<InstructorService>(InstructorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
