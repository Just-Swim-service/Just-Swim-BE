import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from 'src/common/logger/logger.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockRequest: any = {
    cookies: {},
    headers: {},
  };

  const mockResponse: any = {
    locals: {},
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
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { findUserByPk: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
        {
          provide: MyLogger,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  it('should allow access if skipAuth is true', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(true);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no token is present', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    mockRequest.cookies = {};
    mockRequest.headers = {};

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token format is invalid', async () => {
    mockRequest.headers = { authorization: 'Token invalidtoken' };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer invalidtoken' };
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('JsonWebTokenError'),
    );

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 1 });
    (usersService.findUserByPk as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set request.user and response.locals.user if token and user are valid', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockUser = { id: 1, name: 'Test User' };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 1 });
    (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockUser);
  });
});
