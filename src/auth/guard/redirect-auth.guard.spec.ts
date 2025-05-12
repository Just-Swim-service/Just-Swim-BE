import { Test, TestingModule } from '@nestjs/testing';
import { RedirectAuthGuard } from './redirect-auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from 'src/common/logger/logger.service';

describe('RedirectAuthGuard', () => {
  let guard: RedirectAuthGuard;
  let jwtService: JwtService;
  let usersService: UsersService;
  let configService: ConfigService;

  const mockRequest: any = {
    cookies: {},
    headers: {},
  };

  const mockResponse: any = {
    locals: {},
    redirect: jest.fn(),
    clearCookie: jest.fn(),
  };

  const mockContext: any = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserByPk: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: MyLogger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(RedirectAuthGuard);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);

    // 초기화
    mockRequest.cookies = {};
    mockRequest.headers = {};
    mockResponse.redirect.mockClear();
    mockResponse.clearCookie.mockClear();
    mockResponse.locals = {};
  });

  it('should redirect if no token is present', async () => {
    const result = await guard.canActivate(mockContext);
    expect(mockResponse.redirect).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should redirect if token format is invalid', async () => {
    mockRequest.headers = { authorization: 'Token invalidtoken' };
    const result = await guard.canActivate(mockContext);
    expect(mockResponse.redirect).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should redirect and clear cookie if token is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer invalidtoken' };
    jwtService.verifyAsync = jest
      .fn()
      .mockRejectedValue(new Error('Invalid token'));

    const result = await guard.canActivate(mockContext);

    expect(mockResponse.clearCookie).toHaveBeenCalledWith('authorization');
    expect(mockResponse.redirect).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should redirect if user not found', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    jwtService.verifyAsync = jest.fn().mockResolvedValue({ userId: 1 });
    usersService.findUserByPk = jest.fn().mockResolvedValue(null);

    const result = await guard.canActivate(mockContext);

    expect(mockResponse.redirect).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should set request.user and response.locals.user if valid', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockUser = { userId: 1, name: '테스트' };
    jwtService.verifyAsync = jest.fn().mockResolvedValue({ userId: 1 });
    usersService.findUserByPk = jest.fn().mockResolvedValue(mockUser);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockResponse.locals.user).toEqual(mockUser);
  });
});
