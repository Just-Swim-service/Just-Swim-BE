import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController - /auth/refresh', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockRequest = {
    headers: {},
  } as any;

  const mockResponse = {
    cookie: jest.fn(),
    json: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            verifyRefreshToken: jest.fn(),
            getToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            validateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);

    jest.clearAllMocks();
  });

  it('should throw if no refreshToken in cookies', async () => {
    mockRequest.headers.cookie = '';

    await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if refreshToken is invalid', async () => {
    mockRequest.headers.cookie = 'refreshToken=invalid';
    (authService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedException('유효하지 않은 refreshToken입니다.');
    });

    await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should issue new accessToken if refreshToken is valid', async () => {
    mockRequest.headers.cookie = 'refreshToken=validToken';
    (authService.verifyRefreshToken as jest.Mock).mockResolvedValue({
      userId: 1,
    });
    (authService.getToken as jest.Mock).mockResolvedValue({
      accessToken: 'newAccessToken',
    });

    await controller.refresh(mockRequest, mockResponse);

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'authorization',
      'newAccessToken',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.just-swim.kr',
        path: '/',
        maxAge: 1000 * 60 * 60 * 2,
      }),
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'accessToken 재발급 완료',
    });
  });
});
