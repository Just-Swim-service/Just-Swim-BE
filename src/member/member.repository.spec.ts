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
    const mockTransaction = jest.fn(async (callback: any) =>
      callback({
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue({ memberId: 1 }),
        save: jest.fn().mockResolvedValue({ memberId: 1 }),
      }),
    );

    repo.manager.transaction = mockTransaction;

    const result = await memberRepository.insertMemberFromQR(1, 10);
    expect(result).toEqual({ memberId: 1 });
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('should get all members by lecture ID', async () => {
    const mockGetRawMany = jest.fn().mockResolvedValue([{ memberId: 1 }]);
    const mockQB: any = {
      leftJoinAndSelect: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      groupBy: () => mockQB,
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
      leftJoinAndSelect: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      groupBy: () => mockQB,
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
      leftJoinAndSelect: () => mockQB,
      leftJoin: () => mockQB,
      select: () => mockQB,
      where: () => mockQB,
      getRawMany: mockGetRawMany,
    };
    repo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await memberRepository.getMemberInfo(1, 2);
    expect(result).toEqual([{ userId: 1 }]);
    expect(mockGetRawMany).toHaveBeenCalled();
  });
});
