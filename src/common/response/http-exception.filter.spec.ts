import { HttpException, ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { MyLogger } from '../logger/logger.service';
import { ResponseService } from './response.service';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logger: MyLogger;
  let responseService: ResponseService;

  beforeEach(() => {
    logger = { error: jest.fn() } as unknown as MyLogger;
    responseService = { error: jest.fn() } as unknown as ResponseService;
    filter = new HttpExceptionFilter(logger, responseService);
  });

  it('should catch HttpException and log + return formatted error', () => {
    const mockException = new HttpException('예외 메시지', 400);

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
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
      'HTTP 예외 발생: GET /test-url - 예외 메시지',
      expect.any(String),
    );

    expect(responseService.error).toHaveBeenCalledWith(
      mockRes,
      '예외 메시지',
      400,
    );
  });

  it('should extract message from exception response object', () => {
    const mockException = new HttpException({ message: '객체 메시지' }, 403);

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
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

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP 예외 발생: POST /resource - 객체 메시지',
      expect.any(String),
    );

    expect(responseService.error).toHaveBeenCalledWith(
      mockRes,
      '객체 메시지',
      403,
    );
  });
});
