import { HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { MyLogger } from '../logger/logger.service';
import { ResponseService } from './response.service';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: MyLogger;
  let responseService: ResponseService;

  beforeEach(() => {
    logger = { error: jest.fn() } as unknown as MyLogger;
    responseService = { error: jest.fn() } as unknown as ResponseService;
    filter = new AllExceptionsFilter(logger, responseService);
    
    // 환경변수 초기화
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('HttpException 처리', () => {
    it('should catch HttpException and return formatted error', () => {
      const mockException = new HttpException('예외 메시지', 400);

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: false,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(responseService.error).toHaveBeenCalledWith(
        mockRes,
        '예외 메시지',
        400,
        null,
      );
    });

    it('should extract message from exception response object', () => {
      const mockException = new HttpException({ message: '객체 메시지' }, 403);

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: false,
      };

      const mockReq = {
        method: 'POST',
        url: '/resource',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(responseService.error).toHaveBeenCalledWith(
        mockRes,
        '객체 메시지',
        403,
        null,
      );
    });
  });

  describe('일반 Error 처리', () => {
    it('should catch Error and return 500 with error message', () => {
      const mockException = new Error('일반 에러 메시지');
      mockException.stack = 'Error stack trace';

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: false,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(logger.error).toHaveBeenCalledWith(
        '예상치 못한 오류 발생: GET /test-url - 일반 에러 메시지',
        'Error stack trace',
      );

      expect(responseService.error).toHaveBeenCalledWith(
        mockRes,
        '일반 에러 메시지',
        HttpStatus.INTERNAL_SERVER_ERROR,
        null, // test 환경에서는 stack을 포함하지 않음
      );
    });

    it('should include stack trace in development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const mockException = new Error('개발 환경 에러');
      mockException.stack = 'Development stack trace';

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: false,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(responseService.error).toHaveBeenCalledWith(
        mockRes,
        '개발 환경 에러',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { stack: 'Development stack trace' },
      );
    });

    it('should not include stack trace in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const mockException = new Error('프로덕션 에러');
      mockException.stack = 'Production stack trace';

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: false,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(responseService.error).toHaveBeenCalledWith(
        mockRes,
        '프로덕션 에러',
        HttpStatus.INTERNAL_SERVER_ERROR,
        null,
      );
    });
  });

  describe('알 수 없는 예외 처리', () => {
    it('should handle unknown exception types', () => {
      const mockException = { someProperty: 'unknown error' };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: false,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(logger.error).toHaveBeenCalledWith(
        '알 수 없는 오류 발생: GET /test-url',
        JSON.stringify(mockException),
      );

      expect(responseService.error).toHaveBeenCalledWith(
        mockRes,
        '서버 내부 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        null,
      );
    });
  });

  describe('응답 헤더 검증', () => {
    it('should not process if headers already sent', () => {
      const mockException = new HttpException('에러', 400);

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: true,
        writableEnded: false,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(responseService.error).not.toHaveBeenCalled();
    });

    it('should not process if response already ended', () => {
      const mockException = new HttpException('에러', 400);

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
        writableEnded: true,
      };

      const mockReq = {
        method: 'GET',
        url: '/test-url',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockContext);

      expect(responseService.error).not.toHaveBeenCalled();
    });
  });
});

