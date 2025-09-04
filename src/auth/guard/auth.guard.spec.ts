import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from 'src/common/logger/logger.service';
import { UnauthorizedException } from '@nestjs/common';
import { SecurityLoggerService } from 'src/common/security/security-logger.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let usersService: UsersService;
  let securityLogger: SecurityLoggerService;

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
        {
          provide: SecurityLoggerService,
          useValue: {
            logAuthenticationFailure: jest.fn(),
            logTokenEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
    securityLogger = module.get(SecurityLoggerService);
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
    const mockUser = { userId: 1, userType: 'instructor', name: 'Test User' };
    const mockPayload = {
      userId: 1,
      userType: 'instructor',
      email: 'test@example.com',
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      jti: 'test-jti',
      iat: Math.floor(Date.now() / 1000),
    };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
    (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockResponse.locals.user).toEqual(mockUser);
  });

  it('should throw UnauthorizedException if token issuer is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockPayload = {
      userId: 1,
      userType: 'instructor',
      email: 'test@example.com',
      iss: 'invalid-issuer',
      aud: 'just-swim-client',
      jti: 'test-jti',
      iat: Math.floor(Date.now() / 1000),
    };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      '잘못된 토큰 발급자입니다.',
    );
  });

  it('should throw UnauthorizedException if token audience is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockPayload = {
      userId: 1,
      userType: 'instructor',
      email: 'test@example.com',
      iss: 'just-swim-service',
      aud: 'invalid-audience',
      jti: 'test-jti',
      iat: Math.floor(Date.now() / 1000),
    };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      '잘못된 토큰 대상자입니다.',
    );
  });

  it('should throw UnauthorizedException if token is missing required claims', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockPayload = {
      userId: 1,
      userType: 'instructor',
      email: 'test@example.com',
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      // Missing jti and iat
    };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      '토큰에 필수 클레임이 없습니다.',
    );
  });

  it('should throw UnauthorizedException if token is too old', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockPayload = {
      userId: 1,
      userType: 'instructor',
      email: 'test@example.com',
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      jti: 'test-jti',
      iat: Math.floor(Date.now() / 1000) - 400, // 400 seconds ago (over 5 minutes)
    };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      '토큰이 너무 오래되었습니다.',
    );
  });

  it('should throw UnauthorizedException if user type does not match', async () => {
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    const mockUser = { userId: 1, userType: 'customer' };
    const mockPayload = {
      userId: 1,
      userType: 'instructor',
      email: 'test@example.com',
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      jti: 'test-jti',
      iat: Math.floor(Date.now() / 1000),
    };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
    (usersService.findUserByPk as jest.Mock).mockResolvedValue(mockUser);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      '사용자 타입이 일치하지 않습니다.',
    );
  });

  describe('Security Logging', () => {
    it('should log authentication failure for no authorization header', async () => {
      mockRequest.headers = {};
      const logSpy = jest.spyOn(securityLogger, 'logAuthenticationFailure');

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(logSpy).toHaveBeenCalledWith(
        mockRequest,
        'No authorization header provided',
      );
    });

    it('should log authentication failure for invalid authorization format', async () => {
      mockRequest.headers = { authorization: 'InvalidFormat token' };
      const logSpy = jest.spyOn(securityLogger, 'logAuthenticationFailure');

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(logSpy).toHaveBeenCalledWith(
        mockRequest,
        'Invalid authorization format',
        { authorizationType: 'InvalidFormat' },
      );
    });

    it('should log token event for invalid issuer', async () => {
      mockRequest.headers = { authorization: 'Bearer validtoken' };
      const mockPayload = {
        userId: 1,
        userType: 'instructor',
        email: 'test@example.com',
        iss: 'invalid-issuer',
        aud: 'just-swim-client',
        jti: 'test-jti',
        iat: Math.floor(Date.now() / 1000),
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      const logSpy = jest.spyOn(securityLogger, 'logTokenEvent');

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(logSpy).toHaveBeenCalledWith(
        mockRequest,
        'INVALID_TOKEN',
        'Invalid token issuer',
        1,
      );
    });

    it('should log token event for expired token', async () => {
      mockRequest.headers = { authorization: 'Bearer expiredtoken' };
      const logSpy = jest.spyOn(securityLogger, 'logTokenEvent');

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('TokenExpiredError'),
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(logSpy).toHaveBeenCalledWith(
        mockRequest,
        'TOKEN_EXPIRED',
        'JWT token expired',
      );
    });
  });
});
