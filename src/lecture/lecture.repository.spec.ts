import { Test, TestingModule } from '@nestjs/testing';
import { LectureRepository } from './lecture.repository';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { EditLectureDto } from './dto/edit-lecture.dto';
import {
  mockLecture,
  MockLectureRepository,
} from 'src/common/mocks/mock-lecture.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lecture } from './entity/lecture.entity';
import { Repository } from 'typeorm';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  query: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('LectureRepository (with mock)', () => {
  let lectureRepository: LectureRepository;
  let repo: jest.Mocked<Repository<Lecture>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureRepository,
        {
          provide: getRepositoryToken(Lecture),
          useValue: mockRepo,
        },
      ],
    }).compile();

    lectureRepository = module.get<LectureRepository>(LectureRepository);
    repo = module.get(getRepositoryToken(Lecture));
  });

  it('should create a lecture', async () => {
    const dto: CreateLectureDto = {
      lectureTitle: 'Test',
      lectureContent: '내용',
      lectureTime: '10:00-12:00',
      lectureDays: '월수',
      lectureLocation: '강의실 1',
      lectureColor: '#FFFFFF',
      lectureQRCode: 'qr',
      lectureEndDate: '2024-12-31',
    };

    const created = { ...dto, user: { userId: 1 } };
    repo.create.mockReturnValue(created as Lecture);
    repo.save.mockResolvedValue({ lectureId: 1 } as Lecture);

    const result = await lectureRepository.createLecture(1, dto);

    expect(repo.create).toHaveBeenCalledWith(created);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual({ lectureId: 1 });
  });

  it('should update a lecture', async () => {
    const dto: EditLectureDto = {
      lectureTitle: 'Updated',
      lectureContent: '수정된 내용',
      lectureTime: '13:00-15:00',
      lectureDays: '화목',
      lectureLocation: '새 강의실',
      lectureColor: '#000000',
      lectureQRCode: 'new_qr',
      lectureEndDate: '2025-01-01',
    };

    await lectureRepository.updateLecture(1, dto);
    expect(repo.update).toHaveBeenCalledWith({ lectureId: 1 }, dto);
  });

  it('should soft delete a lecture', async () => {
    await lectureRepository.softDeleteLecture(1);
    expect(repo.update).toHaveBeenCalledWith(
      { lectureId: 1 },
      expect.objectContaining({ lectureDeletedAt: expect.any(Date) }),
    );
  });

  it('should call stored procedure for getLectureByPk', async () => {
    repo.query.mockResolvedValue([[{ lectureId: 1 }]]);
    const result = await lectureRepository.getLectureByPk(1, 1);
    expect(repo.query).toHaveBeenCalledWith(
      'CALL GET_LECTURE_BY_PK(?, ?)',
      [1, 1],
    );
    expect(result).toEqual([{ lectureId: 1 }]);
  });

  it('should call stored procedure for getLectures', async () => {
    repo.query.mockResolvedValue([[{ lectureId: 1 }]]);
    const result = await lectureRepository.getLectures();
    expect(repo.query).toHaveBeenCalledWith('CALL GET_LECTURE()');
    expect(result).toEqual([{ lectureId: 1 }]);
  });
});
