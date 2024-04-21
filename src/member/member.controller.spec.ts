import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MockMemberRepository } from './member.service.spec';
import { MemberService } from './member.service';

class MockMemberService {
  insertMemberFromQR = jest.fn();
  checkCustomer = jest.fn();
  getAllMemberByInstructor = jest.fn();
}

const mockMember = new MockMemberRepository().mockMember;

describe('MemberController', () => {
  let controller: MemberController;
  let memberService: MockMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [{ provide: MemberService, useClass: MockMemberService }],
    }).compile();

    controller = module.get<MemberController>(MemberController);
    memberService = module.get<MemberService, MockMemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  //   describe('insertMemberFromQR', () => {
  //     it('QR 코드를 통한 회원 등록', async () => {
  //         const res: Partial<Response> = {
  //             locals: {
  //               user: {
  //                 userId: 1,
  //                 userType: 'instructor',
  //               },
  //             },
  //             status: jest.fn().mockReturnThis(),
  //             json: jest.fn(),
  //           };
  //     });
  //   });
});
