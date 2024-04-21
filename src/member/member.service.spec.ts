import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { Member } from './entity/member.entity';

export class MockMemberRepository {
  readonly mockMember: Member = {
    memberId: 1,
    lectureId: 1,
    userId: 1,
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
            getAllMemberByInstructor: jest.fn().mockResolvedValue(mockMember),
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

  describe('checkCustomer', () => {
    it('회원의 가입여부를 확인', async () => {
      const userId = 1;
      (repository.checkCustomer as jest.Mock).mockResolvedValue(mockMember);

      const result = await service.checkCustomer(userId);

      expect(result).toEqual(mockMember);
    });
  });

  describe('getAllMemberByInstructor', () => {
    it('강사가 개설한 모든 강의에 해당하는 수강생 조회', async () => {
      const lectureId = 1;
      (repository.getAllMemberByInstructor as jest.Mock).mockResolvedValue(
        mockMember,
      );
      const result = await service.getAllMemberByInstructor(lectureId);

      expect(result).toEqual(mockMember);
    });
  });
});
