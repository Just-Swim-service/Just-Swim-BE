import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from 'src/common/logger/logger.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let usersService: UsersService;
  let configService: ConfigService;

  const mockRequest: any = {
    cookies: {},
    headers: {},
  };

  const mockResponse: any = {
    locals: {},
    clearCookie: jest.fn(),
  };

  const mockContext: any = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
    getHandler: () => jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: { get: jest.fn() },
        },
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

    guard = module.get(AuthGuard);
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  it('should allow access if skipAuth is true', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(true);
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw if no token is present', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    mockRequest.cookies = {};
    mockRequest.headers = {};
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if token format is invalid', async () => {
    mockRequest.headers = { authorization: 'Token invalidtoken' };
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if token is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer invalidtoken' };
    jwtService.verifyAsync = jest
      .fn()
      .mockRejectedValue(new Error('Invalid token'));
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('authorization');
  });

  it('should throw UnauthorizedException if user not found (wrapped)', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    jwtService.verifyAsync = jest.fn().mockResolvedValue({ userId: 1 });
    usersService.findUserByPk = jest.fn().mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set request.user and response.locals.user if token and user valid', async () => {
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
