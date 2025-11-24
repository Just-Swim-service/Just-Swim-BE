import { ResponseService } from './response.service';

describe('ResponseService', () => {
  let service: ResponseService;
  let res: any;

  beforeEach(() => {
    service = new ResponseService();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return success response', () => {
    service.success(res, '성공 메시지', { data: 1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: '성공 메시지',
      data: { data: 1 },
    });
  });

  it('should return error response with default status 400', () => {
    service.error(res, '에러 발생');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: '에러 발생',
      errors: null,
    });
  });

  it('should return 401 unauthorized response', () => {
    service.unauthorized(res, '인증 실패');

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: '인증 실패',
      errors: null,
    });
  });

  it('should return 404 not found response', () => {
    service.notFound(res, '찾을 수 없음');

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: '찾을 수 없음',
      errors: null,
    });
  });

  it('should return 409 conflict response', () => {
    service.conflict(res, '충돌 발생');

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: '충돌 발생',
      errors: null,
    });
  });

  it('should return 403 forbidden response', () => {
    service.forbidden(res, '금지된 요청');

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: '금지된 요청',
      errors: null,
    });
  });

  it('should return 500 internal server error response', () => {
    const errors = { code: 'E500' };

    service.internalServerError(res, '서버 오류', errors);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: '서버 오류',
      errors,
    });
  });

  describe('제네릭 타입 지원', () => {
    it('should handle success with typed data', () => {
      interface UserData {
        id: number;
        name: string;
      }

      const userData: UserData = { id: 1, name: '테스트 사용자' };
      service.success<UserData>(res, '사용자 조회 성공', userData);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '사용자 조회 성공',
        data: userData,
      });
    });

    it('should handle success with null data', () => {
      service.success(res, '성공 메시지', null);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '성공 메시지',
        data: null,
      });
    });

    it('should handle success with array data', () => {
      const items = [1, 2, 3];
      service.success<number[]>(res, '목록 조회 성공', items);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '목록 조회 성공',
        data: items,
      });
    });

    it('should handle error with typed error details', () => {
      interface ValidationError {
        field: string;
        message: string;
      }

      const validationErrors: ValidationError[] = [
        { field: 'email', message: '이메일 형식이 올바르지 않습니다.' },
        { field: 'password', message: '비밀번호는 8자 이상이어야 합니다.' },
      ];

      service.error<ValidationError[]>(res, '유효성 검사 실패', 422, validationErrors);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '유효성 검사 실패',
        errors: validationErrors,
      });
    });

    it('should handle error with object error details', () => {
      const errorDetails = {
        code: 'VALIDATION_ERROR',
        fields: ['email', 'password'],
        timestamp: new Date().toISOString(),
      };

      service.error(res, '유효성 검사 실패', 400, errorDetails);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '유효성 검사 실패',
        errors: errorDetails,
      });
    });

    it('should handle error with null errors', () => {
      service.error(res, '에러 발생', 500, null);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '에러 발생',
        errors: null,
      });
    });

    it('should handle internalServerError with typed errors', () => {
      interface ServerError {
        code: string;
        details: string;
        stack?: string;
      }

      const serverError: ServerError = {
        code: 'INTERNAL_ERROR',
        details: 'Database connection failed',
        stack: 'Error: Connection timeout...',
      };

      service.internalServerError<ServerError>(res, '서버 오류', serverError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '서버 오류',
        errors: serverError,
      });
    });
  });

  describe('응답 헤더 검증', () => {
    it('should not send response if headers already sent', () => {
      const resWithHeadersSent = {
        ...res,
        headersSent: true,
        writableEnded: false,
      };

      service.error(resWithHeadersSent, '에러', 400);

      expect(resWithHeadersSent.status).not.toHaveBeenCalled();
      expect(resWithHeadersSent.json).not.toHaveBeenCalled();
    });

    it('should not send response if response already ended', () => {
      const resEnded = {
        ...res,
        headersSent: false,
        writableEnded: true,
      };

      service.error(resEnded, '에러', 400);

      expect(resEnded.status).not.toHaveBeenCalled();
      expect(resEnded.json).not.toHaveBeenCalled();
    });
  });
});
