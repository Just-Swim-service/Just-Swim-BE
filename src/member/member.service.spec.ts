import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { NotFoundException } from '@nestjs/common';
import {
  mockMember,
  MockMemberRepository,
} from 'src/common/mocks/mock-member.repository';

describe('MemberService', () => {
  let service: MemberService;
  let repository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: MemberRepository,
          useValue: MockMemberRepository,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<MemberRepository>(MemberRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertMemberFromQR', () => {
    it('QR을 통해 수강생으로 등록', async () => {
      const result = await service.insertMemberFromQR(1, 'nickname', 1);
      expect(result).toEqual(mockMember);
    });
  });

  describe('getAllMembersByLectureId', () => {
    it('강의에 속한 모든 수강생 조회', async () => {
      const result = await service.getAllMembersByLectureId(1);
      expect(result).toEqual([mockMember]);
    });
  });

  describe('getAllMembersByFeedback', () => {
    it('강사가 피드백을 작성할 수 있는 수강생 조회', async () => {
      const result = await service.getAllMembersByFeedback(1);
      expect(result).toEqual([mockMember]);
    });
  });

  describe('getMemberInfo', () => {
    it('강사가 특정 수강생의 정보를 조회', async () => {
      const result = await service.getMemberInfo(1, 1);

      expect(result).toEqual({
        userId: 1,
        profileImage: 'image.jpg',
        name: '홍길동',
        birth: '1990-01-01',
        email: 'hong@example.com',
        phoneNumber: '010-1234-5678',
        lectures: [
          {
            lectureId: 10,
            lectureTitle: '강의 제목',
            lectureContent: '강의 내용',
            lectureLocation: '강의실 101',
            lectureColor: '#FF0000',
            lectureDays: ['월', '수'],
            lectureTime: '10:00~12:00',
          },
        ],
        feedback: [
          {
            feedbackId: 100,
            feedbackDate: '2024-01-01',
            feedbackType: '긍정적',
            feedbackContent: '좋았어요!',
            images: [{ imagePath: 'img1.jpg' }, { imagePath: 'img2.jpg' }],
          },
        ],
      });
    });

    it('수강생 정보가 없으면 NotFoundException 발생', async () => {
      (repository.getMemberInfo as jest.Mock).mockResolvedValue([]);
      await expect(service.getMemberInfo(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });


});
