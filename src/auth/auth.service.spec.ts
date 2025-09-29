import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/entity/users.entity';
import { MyLogger } from 'src/common/logger/logger.service';
import { UserType } from 'src/users/enum/user-type.enum';
import { SessionManagerService } from 'src/common/security/session-manager.service';

jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let logger: MyLogger;
  let sessionManager: SessionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
            updateRefreshToken: jest.fn(),
            findUserByPk: jest.fn(),
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
        {
          provide: SessionManagerService,
          useValue: {
            createSession: jest.fn(),
            validateSession: jest.fn(),
            invalidateSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    logger = module.get<MyLogger>(MyLogger);
    sessionManager = module.get<SessionManagerService>(SessionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('email과 provider가 맞는 user가 있을 경우 user 정보 return', async () => {
      const email = 'test@example.com';
      const provider = 'test_provider';
      const exUser: Users = {
        userId: 1,
        email,
        provider,
        name: '홍길동',
        birth: null,
        profileImage: null,
        phoneNumber: null,
        refreshToken: null,
        userType: UserType.Customer,
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
        communities: [],
        commentLikes: [],
        communityComments: [],
        communityLikes: [],
      };
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(exUser);

      const result = await service.validateUser(email, provider);

      expect(result).toEqual(exUser);
    });

    it('email과 provider가 맞는 user가 없을 경우 null return', async () => {
      const email = 'nonexistent@example.com';
      const provider = 'nonexistent_provider';
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser(email, provider);

      expect(result).toBeNull();
    });
  });

  describe('getToken', () => {
    it('userId를 포함하는 token return', async () => {
      const userId = 1;
      const mockUser = {
        userId: 1,
        userType: UserType.Instructor,
        email: 'test@example.com',
      } as Users;
      const accessToken = 'mocked_access_token';
      const refreshToken = 'mocked_refresh_token';

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.getToken(userId);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(usersService.findUserByPk).toHaveBeenCalledWith(userId);
      expect(jwt.sign).toHaveBeenCalledTimes(2);

      // 첫 번째 호출은 accessToken 생성 (확장된 클레임 포함)
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          userId,
          userType: mockUser.userType,
          email: mockUser.email,
          iss: 'https://api.just-swim.kr',
          aud: 'https://just-swim.kr',
          jti: expect.any(String),
          iat: expect.any(Number),
        }),
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' },
      );

      // 두 번째 호출은 refreshToken 생성
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          userId,
          jti: expect.any(String),
          iss: 'https://api.just-swim.kr',
          aud: 'https://just-swim.kr',
          iat: expect.any(Number),
        }),
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '14d' },
      );
    });

    it('should create session when IP and User-Agent provided', async () => {
      const userId = 1;
      const mockUser = {
        userId: 1,
        userType: UserType.Instructor,
        email: 'test@example.com',
      } as Users;
      const accessToken = 'mocked_access_token';
      const refreshToken = 'mocked_refresh_token';
      const sessionId = 'mocked_session_id';

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      (sessionManager.createSession as jest.Mock).mockReturnValue(sessionId);

      const result = await service.getToken(
        userId,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual({ accessToken, refreshToken, sessionId });
      expect(sessionManager.createSession).toHaveBeenCalledWith(
        userId,
        mockUser.userType,
        '192.168.1.1',
        'Mozilla/5.0',
      );
    });

    it('should not create session when IP or User-Agent not provided', async () => {
      const userId = 1;
      const mockUser = {
        userId: 1,
        userType: UserType.Instructor,
        email: 'test@example.com',
      } as Users;
      const accessToken = 'mocked_access_token';
      const refreshToken = 'mocked_refresh_token';

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.getToken(userId);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(sessionManager.createSession).not.toHaveBeenCalled();
    });
  });

  describe('generateAccessToken', () => {
    it('should return new access token', async () => {
      const userId = 1;
      const mockUser = {
        userId: 1,
        userType: UserType.Instructor,
        email: 'test@example.com',
      } as Users;
      const accessToken = 'new_access_token';

      (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(accessToken);

      const result = await service.generateAccessToken(userId);

      expect(result).toEqual({ accessToken });
      expect(usersService.findUserByPk).toHaveBeenCalledWith(userId);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          userType: mockUser.userType,
          email: mockUser.email,
          iss: 'https://api.just-swim.kr',
          aud: 'https://just-swim.kr',
          jti: expect.any(String),
          iat: expect.any(Number),
        }),
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' },
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user with the provided data', async () => {
      const userData = {
        email: 'newuser@example.com',
        profileImage: 'profile_image_url',
        name: 'New User',
        provider: 'test_provider',
        userType: UserType.Customer,
      };
      const newUser: Users = {
        userId: 2,
        ...userData,
        birth: null,
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
        communities: [],
        commentLikes: [],
        communityComments: [],
        communityLikes: [],
      };
      (usersService.createUser as jest.Mock).mockResolvedValue(newUser);

      const result = await service.createUser(userData);

      expect(result).toEqual(newUser);
    });
  });
});
