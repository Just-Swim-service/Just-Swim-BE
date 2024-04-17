import { Test, TestingModule } from '@nestjs/testing';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { LectureService } from './lecture.service';

export class MockLectureRepository {
  readonly mockLecture: Lecture = {
    lectureId: 1,
    instructorId: 1,
    lectureTitle: '아침 5반',
    lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
    lectureTime: '12:00-14:00',
    lectureDays: '화목',
    lectureLevel: '고급',
    lectureLocation: '강동구 실내 수영장',
    lectureColor: '#F1554C',
    lectureQRCode: 'QR 코드',
    lectureEndDate: '2024.05.31',
    lectureCreatedAt: new Date(),
    lectureUpdatedAt: new Date(),
    lectureDeletedAt: null,
  };
}

describe('LectureService', () => {
  let service: LectureService;
  let repository: LectureRepository;

  const mockLecture = new MockLectureRepository().mockLecture;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureService,
        {
          provide: LectureRepository,
          useValue: {
            getLectures: jest.fn().mockResolvedValue(mockLecture),
            getLectureById: jest.fn().mockResolvedValue(mockLecture),
            updateLecture: jest.fn().mockResolvedValue(mockLecture),
            softDeleteLecture: jest.fn().mockResolvedValue(mockLecture),
            createLecture: jest.fn().mockResolvedValue(mockLecture),
          },
        },
      ],
    }).compile();

    service = module.get<LectureService>(LectureService);
    repository = module.get<LectureRepository>(LectureRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLectures', () => {
    it('');
  });
});
