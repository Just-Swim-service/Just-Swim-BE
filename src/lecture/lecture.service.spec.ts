import { Test, TestingModule } from '@nestjs/testing';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './lecture.repository';
import { LectureService } from './lecture.service';
import { UpdateResult } from 'typeorm';
import { MyLogger } from 'src/common/logger/logger.service';
import { MemberRepository } from 'src/member/member.repository';
import { MockMemberRepository } from 'src/member/member.service.spec';

export class MockLectureRepository {
  readonly mockLecture: Lecture = {
    lectureId: 1,
    userId: 1,
    lectureTitle: '아침 5반',
    lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
    lectureTime: '12:00-14:00',
    lectureDays: '화목',
    lectureLocation: '강동구 실내 수영장',
    lectureColor: '#F1554C',
    lectureQRCode: 'QR 코드',
    lectureEndDate: '2024.05.31',
    lectureCreatedAt: new Date(),
    lectureUpdatedAt: new Date(),
    lectureDeletedAt: null,
    member: [],
    feedbackTarget: [],
  };
}

describe('LectureService', () => {
  let service: LectureService;
  let lectureRepository: LectureRepository;
  let memberRepository: MemberRepository;
  let logger: MyLogger;

  const mockLecture = new MockLectureRepository().mockLecture;
  const mockMember = new MockMemberRepository().mockMember;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureService,
        {
          provide: LectureRepository,
          useValue: {
            getLectures: jest.fn().mockResolvedValue(mockLecture),
            getLecturesByInstructor: jest.fn().mockResolvedValue(mockLecture),
            getAllLecturesByInstructor: jest
              .fn()
              .mockResolvedValue(mockLecture),
            getLectureByPk: jest.fn().mockResolvedValue(mockLecture),
            updateLecture: jest.fn().mockResolvedValue(mockLecture),
            softDeleteLecture: jest.fn().mockResolvedValue(mockLecture),
            createLecture: jest.fn().mockResolvedValue(mockLecture),
          },
        },
        {
          provide: MemberRepository,
          useValue: {
            insertMemberFromQR: jest.fn().mockResolvedValue(mockMember),
            getAllMemberByLectureId: jest.fn().mockResolvedValue(mockMember),
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

    service = module.get<LectureService>(LectureService);
    lectureRepository = module.get<LectureRepository>(LectureRepository);
    memberRepository = module.get<MemberRepository>(MemberRepository);
    logger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLectures', () => {
    it('모든 lecture를 return', async () => {
      (lectureRepository.getLectures as jest.Mock).mockResolvedValue([
        { mockLecture },
      ]);

      const result = await service.getLectures();

      expect(result).toEqual([{ mockLecture }]);
    });
  });

  describe('getLecturesByInstructor', () => {
    it('userId에 해당하는 삭제 또는 지난 lecture를 제외하고 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getLecturesByInstructor as jest.Mock
      ).mockResolvedValue(mockLecture);

      const result = await service.getLecturesByInstructor(userId);

      expect(result).toEqual(mockLecture);
    });
  });

  describe('getAllLecturesByInstructor', () => {
    it('userId에 해당하는 모든 lecture를 조회하여 return', async () => {
      const userId = 1;
      (
        lectureRepository.getAllLecturesByInstructor as jest.Mock
      ).mockResolvedValue(mockLecture);

      const result = await service.getAllLecturesByInstructor(userId);

      expect(result).toEqual(mockLecture);
    });
  });

  describe('getLectureByPk', () => {
    it('lectureId에 해당하는 lecture의 상세한 정보를 return', async () => {
      const userId = 1;
      const lectureId = 1;

      (lectureRepository.getLectureByPk as jest.Mock).mockResolvedValue(
        mockLecture,
      );
      (memberRepository.getAllMemberByLectureId as jest.Mock).mockResolvedValue(
        mockMember,
      );

      const result = await service.getLectureByPk(userId, lectureId);

      expect(result).toEqual({
        lecture: mockLecture,
        lectureMembers: mockMember,
      });
    });
  });

  describe('updateLecture', () => {
    it('lectureId에 해당하는 lecture를 수정하고 updateResult를 return', async () => {
      const userId = 1;
      const lectureId = 1;
      const editLectureDto = {
        lectureTitle: '아침 3반',
        lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
        lectureTime: '12:00-14:00',
        lectureDays: '화목',
        lectureLocation: '고양체육관',
        lectureColor: '#F1547C',
        lectureQRCode: 'QR 코드',
        lectureEndDate: '2024.05.31',
      };
      await service.updateLecture(userId, lectureId, editLectureDto);
      expect(lectureRepository.updateLecture).toHaveBeenCalledWith(
        lectureId,
        editLectureDto,
      );
    });
  });

  describe('softDeleteLecture', () => {
    it('lectureId에 해당하는 lecture를 softDelete하고 updateResult를 return', async () => {
      const userId = 1;
      const lectureId = 1;

      await service.softDeleteLecture(userId, lectureId);
      expect(lectureRepository.softDeleteLecture).toHaveBeenCalledWith(
        lectureId,
      );
    });
  });

  describe('createLecture', () => {
    it('instructor에 의해 새로운 lecture를 생성하고 newLecture를 return', async () => {
      const userId = 1;
      const lectureDto = {
        lectureTitle: '아침 3반',
        lectureContent: '이 강의는 고급자를 대상으로 합니다. 응용을 다룹니다.',
        lectureTime: '12:00-14:00',
        lectureDays: '화목',
        lectureLocation: '고양체육관',
        lectureColor: '#F1547C',
        lectureQRCode: 'QR 코드',
        lectureEndDate: '2024.05.31',
      };
      const newLecture: Lecture = {
        userId,
        lectureId: 2,
        ...lectureDto,
        lectureCreatedAt: new Date(),
        lectureUpdatedAt: new Date(),
        lectureDeletedAt: null,
        member: [],
        feedbackTarget: [],
      };
      (lectureRepository.createLecture as jest.Mock).mockResolvedValue(
        newLecture,
      );

      const result = await service.createLecture(userId, lectureDto);

      expect(result).toEqual(newLecture);
    });
  });
});
