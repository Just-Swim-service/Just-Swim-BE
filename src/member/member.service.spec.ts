import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { Users } from 'src/users/entity/users.entity';

export class MockMemberRepository {
  readonly mockMember: Member = {
    memberId: 1,
    lecture: new Lecture(),
    user: new Users(),
    memberNickname: '홍길동',
    memberCreatedAt: new Date(),
    memberUpdatedAt: new Date(),
    memberDeletedAt: null,
  };
}

describe('MemberService', () => {
  let service: MemberService;
  let repository: MemberRepository;

  const mockMember = new MockMemberRepository().mockMember;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: MemberRepository,
          useValue: {
            insertMemberFromQR: jest.fn().mockResolvedValue(mockMember),
            checkCustomer: jest.fn().mockResolvedValue(mockMember),
            getAllMembersByLectureId: jest.fn().mockResolvedValue(mockMember),
            getAllMembersByFeedback: jest.fn().mockResolvedValue(mockMember),
          },
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<MemberRepository>(MemberRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertMemberFromQR', () => {
    it('QR을 통해 수강생으로 입장', async () => {
      const userId = 1;
      const lectureId = 1;
      (repository.insertMemberFromQR as jest.Mock).mockResolvedValue(
        mockMember,
      );

      const result = await service.insertMemberFromQR(userId, lectureId);

      expect(result).toEqual(mockMember);
    });
  });

  describe('getAllMembersByInstructor', () => {
    it('강사가 개설한 모든 강의에 해당하는 수강생 조회', async () => {
      const lectureId = 1;
      (repository.getAllMembersByLectureId as jest.Mock).mockResolvedValue(
        mockMember,
      );
      const result = await service.getAllMembersByLectureId(lectureId);

      expect(result).toEqual(mockMember);
    });
  });

  describe('getAllMembersByFeedback', () => {
    it('강사에 해당하는 모든 수강생을 조회', async () => {
      const userId = 1;
      (repository.getAllMembersByFeedback as jest.Mock).mockResolvedValue(
        mockMember,
      );
      const result = await service.getAllMembersByFeedback(userId);

      expect(result).toEqual(mockMember);
    });
  });
});
