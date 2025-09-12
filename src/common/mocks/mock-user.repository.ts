import { Users } from 'src/users/entity/users.entity';
import { UserType } from 'src/users/enum/user-type.enum';

export const mockUser: Users = {
  userId: 1,
  userType: UserType.Customer,
  email: 'test@example.com',
  provider: 'kakao',
  name: '홍길동',
  birth: null,
  profileImage: 'old_profile_image_url',
  phoneNumber: null,
  refreshToken: null,
  userCreatedAt: new Date(),
  userUpdatedAt: new Date(),
  userDeletedAt: null,
  customer: [],
  instructor: [],
  member: [],
  lecture: [],
  feedback: [],
  feedbackTarget: [],
  withdrawalReason: [],
  notification: [],
};

export const MockUsersRepository = {
  findUserByEmail: jest.fn().mockResolvedValue(mockUser),
  findUserByPk: jest.fn().mockResolvedValue(mockUser),
  createUser: jest.fn().mockResolvedValue(mockUser),
  selectUserType: jest.fn().mockResolvedValue(mockUser),
  editUserProfile: jest.fn().mockResolvedValue(mockUser),
  withdrawUser: jest.fn().mockResolvedValue(mockUser),
};
