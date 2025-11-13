import { Test, TestingModule } from '@nestjs/testing';
import { MemberRepository } from './member.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from './entity/member.entity';
import { Repository } from 'typeorm';

describe('MemberRepository', () => {
  let memberRepository: MemberRepository;
  let repo: jest.Mocked<Repository<Member>>;

  const mockRepo = {
    manager: {
      transaction: jest.fn(),
    },
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberRepository,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepo,
        },
      ],
    }).compile();

    memberRepository = module.get<MemberRepository>(MemberRepository);
    repo = module.get(getRepositoryToken(Member));
  });

  it('should insert member from QR', async () => {
    const mockLecture = {
      lectureId: 10,
      lectureTitle: '수영 강습',
      lectureDeletedAt: null,
      lectureEndDate: '2025-12-31',
    };

    const mockFindOne = jest
      .fn()
      .mockResolvedValueOnce(mockLecture) // 첫 번째 호출: 강의 조회
      .mockResolvedValueOnce(null); // 두 번째 호출: 중복 회원 체크

    const mockTransaction = jest.fn(async (callback: any) =>
      callback({
        findOne: mockFindOne,
        create: jest.fn().mockReturnValue({ memberId: 1 }),
        save: jest.fn().mockResolvedValue({ memberId: 1 }),
      }),
    );

    repo.manager.transaction = mockTransaction;

    const result = await memberRepository.insertMemberFromQR(1, 'nickname', 10);
    expect(result).toEqual({ memberId: 1 });
    expect(mockTransaction).toHaveBeenCalled();
    expect(mockFindOne).toHaveBeenCalledTimes(2);
  });

  it('should throw NotFoundException when lecture does not exist', async () => {
    const mockTransaction = jest.fn(async (callback: any) =>
      callback({
        findOne: jest.fn().mockResolvedValue(null), // 강의가 없음
      }),
    );

    repo.manager.transaction = mockTransaction;

    await expect(
      memberRepository.insertMemberFromQR(1, 'nickname', 999),
    ).rejects.toThrow('존재하지 않거나 삭제된 강의입니다.');
  });

  it('should throw BadRequestException when lecture has ended', async () => {
    const mockLecture = {
      lectureId: 10,
      lectureTitle: '수영 강습',
      lectureDeletedAt: null,
      lectureEndDate: '2020-01-01', // 종료된 강의
    };

    const mockTransaction = jest.fn(async (callback: any) =>
      callback({
        findOne: jest.fn().mockResolvedValue(mockLecture),
      }),
    );

    repo.manager.transaction = mockTransaction;

    await expect(
      memberRepository.insertMemberFromQR(1, 'nickname', 10),
    ).rejects.toThrow('종료된 강의입니다.');
  });

  it('should throw ConflictException when member already exists', async () => {
    const mockLecture = {
      lectureId: 10,
      lectureTitle: '수영 강습',
      lectureDeletedAt: null,
      lectureEndDate: '2025-12-31',
    };

    const mockExistingMember = {
      memberId: 1,
      userId: 1,
      lectureId: 10,
    };

    const mockFindOne = jest
      .fn()
      .mockResolvedValueOnce(mockLecture) // 첫 번째 호출: 강의 조회
      .mockResolvedValueOnce(mockExistingMember); // 두 번째 호출: 이미 등록된 회원

    const mockTransaction = jest.fn(async (callback: any) =>
      callback({
        findOne: mockFindOne,
      }),
    );

    repo.manager.transaction = mockTransaction;

    await expect(
      memberRepository.insertMemberFromQR(1, 'nickname', 10),
    ).rejects.toThrow('이미 등록된 수업입니다.');
  });

  it('should get all members by lecture ID', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ memberId: 1 }]);
    const mockQB: any = {
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      orderBy: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await memberRepository.getAllMembersByLectureId(10);
    expect(result).toEqual([{ memberId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });

  it('should get all members by feedback', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ memberId: 1 }]);
    const mockQB: any = {
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      orderBy: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await memberRepository.getAllMembersByFeedback(1);
    expect(result).toEqual([{ memberId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });

  it('should get member info', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ userId: 1 }]);
    const mockQB: any = {
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      orderBy: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await memberRepository.getMemberInfo(1, 2);
    expect(result).toEqual([{ userId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });

  describe('checkMemberExists', () => {
    it('should return true when member exists', async () => {
      const mockMember = {
        memberId: 1,
        user: { userId: 1 },
        lecture: { lectureId: 1 },
        memberNickname: 'test-nickname',
        memberCreatedAt: new Date(),
        memberUpdatedAt: new Date(),
        memberDeletedAt: null,
      } as any;

      repo.findOne.mockResolvedValue(mockMember);

      const result = await memberRepository.checkMemberExists(1, 1);

      expect(result).toBe(true);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: 1 },
          lecture: { lectureId: 1 },
          memberDeletedAt: null,
        },
      });
    });

    it('should return false when member does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await memberRepository.checkMemberExists(1, 1);

      expect(result).toBe(false);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: 1 },
          lecture: { lectureId: 1 },
          memberDeletedAt: null,
        },
      });
    });

    it('should return false when member is deleted', async () => {
      // 삭제된 멤버는 memberDeletedAt: null 조건으로 조회되지 않으므로 null 반환
      repo.findOne.mockResolvedValue(null);

      const result = await memberRepository.checkMemberExists(1, 1);

      expect(result).toBe(false);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: 1 },
          lecture: { lectureId: 1 },
          memberDeletedAt: null,
        },
      });
    });

    it('should handle different user and lecture IDs', async () => {
      const mockMember = {
        memberId: 2,
        user: { userId: 5 },
        lecture: { lectureId: 10 },
        memberNickname: 'test-nickname',
        memberCreatedAt: new Date(),
        memberUpdatedAt: new Date(),
        memberDeletedAt: null,
      } as any;

      repo.findOne.mockResolvedValue(mockMember);

      const result = await memberRepository.checkMemberExists(5, 10);

      expect(result).toBe(true);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: 5 },
          lecture: { lectureId: 10 },
          memberDeletedAt: null,
        },
      });
    });
  });
});
