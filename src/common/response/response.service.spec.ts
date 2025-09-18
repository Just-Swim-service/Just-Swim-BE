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
});
