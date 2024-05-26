import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MockMemberRepository } from './member.service.spec';
import { MemberService } from './member.service';
import { UsersService } from 'src/users/users.service';

class MockMemberService {
  insertMemberFromQR = jest.fn();
  checkCustomer = jest.fn();
  getAllMemberByInstructor = jest.fn();
}

class MockUsersService {
  findUserByEmail = jest.fn();
  createUser = jest.fn();
  findUserByPk = jest.fn();
  selectUserType = jest.fn();
  editUserProfile = jest.fn();
}

const mockMember = new MockMemberRepository().mockMember;

describe('MemberController', () => {
  let controller: MemberController;
  let memberService: MockMemberService;
  let usersService: MockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        { provide: MemberService, useClass: MockMemberService },
        { provide: UsersService, useClass: MockUsersService },
      ],
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
