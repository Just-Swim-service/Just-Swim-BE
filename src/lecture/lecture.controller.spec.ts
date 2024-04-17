import { Test, TestingModule } from '@nestjs/testing';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';

class MockLectureService {
  getLectures = jest.fn();
  getLectureById = jest.fn();
  updateLecture = jest.fn();
  softDeleteLecture = jest.fn();
  createLecture = jest.fn();
}

describe('LectureController', () => {
  let controller: LectureController;
  let lectureService: LectureService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LectureController],
      providers: [{ provide: LectureService, useClass: MockLectureService }],
    }).compile();

    controller = module.get<LectureController>(LectureController);
    lectureService = module.get<LectureService>(LectureService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLectures', () => {
    it('');
  });
});
