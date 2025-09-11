import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { SecurityGuard } from './security.guard';

describe('SecurityGuard', () => {
  let guard: SecurityGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityGuard],
    }).compile();

    guard = module.get<SecurityGuard>(SecurityGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        url: '/api/test',
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'content-length': '1000',
        },
        body: { test: 'data' },
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;
    });

    it('should allow normal requests', () => {
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should block requests with SQL injection patterns in URL', () => {
      mockRequest.url = '/api/test?q=1 OR 1=1';

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should block requests with XSS patterns in URL', () => {
      mockRequest.url = '/api/test?q=<script>alert("xss")</script>';

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should block requests with SQL injection patterns in body', () => {
      mockRequest.body = { query: 'SELECT * FROM users WHERE id = 1 OR 1=1' };

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should block requests with XSS patterns in body', () => {
      mockRequest.body = { content: '<script>alert("xss")</script>' };

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should block requests with suspicious user agent', () => {
      mockRequest.headers['user-agent'] = 'sqlmap/1.0';

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should block requests that are too large', () => {
      mockRequest.headers['content-length'] = '11000000'; // 11MB

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should allow requests with normal content length', () => {
      mockRequest.headers['content-length'] = '5000'; // 5KB

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should handle requests without content-length header', () => {
      delete mockRequest.headers['content-length'];

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should handle requests without body', () => {
      delete mockRequest.body;

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});
