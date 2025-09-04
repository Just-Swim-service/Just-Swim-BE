import { Test, TestingModule } from '@nestjs/testing';
import {
  SecurityLoggerService,
  SecurityEventType,
} from './security-logger.service';

describe('SecurityLoggerService', () => {
  let service: SecurityLoggerService;
  let loggerSpy: {
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  // 공통 mock Request 객체 생성 함수
  const createMockRequest = (overrides: any = {}) => ({
    ip: '192.168.1.1',
    headers: { 'user-agent': 'Mozilla/5.0' },
    url: '/api/test',
    method: 'POST',
    body: {},
    get: jest.fn((header: string) => {
      if (header === 'User-Agent') return 'Mozilla/5.0';
      return undefined;
    }),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityLoggerService],
    }).compile();

    service = module.get<SecurityLoggerService>(SecurityLoggerService);

    // SecurityLoggerService의 내부 logger를 모킹
    loggerSpy = {
      warn: jest.spyOn(service['logger'], 'warn'),
      error: jest.spyOn(service['logger'], 'error'),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logSecurityEvent', () => {
    it('should log security event with WARN level', () => {
      const logData = {
        eventType: SecurityEventType.AUTHENTICATION_FAILURE,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        endpoint: '/api/test',
        method: 'POST',
        timestamp: new Date(),
      };

      service.logSecurityEvent(logData);

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] AUTHENTICATION_FAILURE'),
      );
    });

    it('should log critical events with ERROR level', () => {
      const logData = {
        eventType: SecurityEventType.SQL_INJECTION_ATTEMPT,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        endpoint: '/api/test',
        method: 'POST',
        timestamp: new Date(),
      };

      service.logSecurityEvent(logData);

      expect(loggerSpy.warn).toHaveBeenCalled();
      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL SECURITY EVENT'),
      );
    });
  });

  describe('logAuthenticationFailure', () => {
    it('should log authentication failure', () => {
      const mockRequest = createMockRequest({
        url: '/api/auth/login',
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      service.logAuthenticationFailure(mockRequest, 'Invalid credentials');

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] AUTHENTICATION_FAILURE'),
      );
    });
  });

  describe('logAuthorizationFailure', () => {
    it('should log authorization failure', () => {
      const mockRequest = createMockRequest({
        url: '/api/lecture/123',
        method: 'GET',
        user: { userId: 123, userType: 'customer' },
      });

      service.logAuthorizationFailure(
        mockRequest,
        123,
        'customer',
        'Insufficient permissions',
      );

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] AUTHORIZATION_FAILURE'),
      );
    });
  });

  describe('logRateLimitExceeded', () => {
    it('should log rate limit exceeded', () => {
      const mockRequest = createMockRequest({
        url: '/api/auth/refresh',
        method: 'POST',
      });

      service.logRateLimitExceeded(mockRequest, 123, 'instructor');

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] RATE_LIMIT_EXCEEDED'),
      );
    });
  });

  describe('logSuspiciousInput', () => {
    it('should log SQL injection attempt', () => {
      const mockRequest = createMockRequest({
        url: '/api/lecture',
        method: 'POST',
        body: { title: "'; DROP TABLE users; --" },
      });

      service.logSuspiciousInput(
        mockRequest,
        "'; DROP TABLE users; --",
        'SQL_INJECTION',
        123,
      );

      expect(loggerSpy.warn).toHaveBeenCalled();
      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL SECURITY EVENT'),
      );
    });

    it('should log XSS attempt', () => {
      const mockRequest = createMockRequest({
        url: '/api/lecture',
        method: 'POST',
        body: { content: '<script>alert("xss")</script>' },
      });

      service.logSuspiciousInput(
        mockRequest,
        '<script>alert("xss")</script>',
        'XSS',
        123,
      );

      expect(loggerSpy.warn).toHaveBeenCalled();
      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL SECURITY EVENT'),
      );
    });
  });

  describe('logTokenEvent', () => {
    it('should log invalid token event', () => {
      const mockRequest = createMockRequest({
        url: '/api/lecture',
        method: 'GET',
      });

      service.logTokenEvent(
        mockRequest,
        SecurityEventType.INVALID_TOKEN,
        'Invalid token format',
      );

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] INVALID_TOKEN'),
      );
    });

    it('should log token expired event', () => {
      const mockRequest = createMockRequest({
        url: '/api/lecture',
        method: 'GET',
      });

      service.logTokenEvent(
        mockRequest,
        SecurityEventType.TOKEN_EXPIRED,
        'Token has expired',
      );

      expect(loggerSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] TOKEN_EXPIRED'),
      );
    });
  });

  describe('logSuspiciousActivity', () => {
    it('should log suspicious activity', () => {
      const mockRequest = createMockRequest({
        url: '/api/lecture',
        method: 'GET',
        user: { userId: 123, userType: 'instructor' },
      });

      service.logSuspiciousActivity(
        mockRequest,
        'IP address changed',
        123,
        'instructor',
        { oldIp: '192.168.1.2', newIp: '192.168.1.1' },
      );

      expect(loggerSpy.warn).toHaveBeenCalled();
      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL SECURITY EVENT'),
      );
    });
  });
});
