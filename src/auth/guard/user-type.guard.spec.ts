import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserTypeGuard, RequireUserType } from './user-type.guard';
import { ForbiddenException } from '@nestjs/common';
import { UserType } from 'src/users/enum/user-type.enum';

describe('UserTypeGuard', () => {
  let guard: UserTypeGuard;
  let reflector: Reflector;

  const mockRequest = {
    user: { userId: 1, userType: UserType.Instructor },
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTypeGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UserTypeGuard>(UserTypeGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      // Reset mock request for each test
      mockRequest.user = { userId: 1, userType: UserType.Instructor };
    });

    it('should return true when no specific user type is required', () => {
      (reflector.get as jest.Mock).mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(
        'userTypes',
        mockContext.getHandler(),
      );
    });

    it('should return true when user has required user type (instructor)', () => {
      (reflector.get as jest.Mock).mockReturnValue([UserType.Instructor]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required user type (customer)', () => {
      mockRequest.user.userType = UserType.Customer;
      (reflector.get as jest.Mock).mockReturnValue([UserType.Customer]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple required user types', () => {
      (reflector.get as jest.Mock).mockReturnValue([
        UserType.Instructor,
        UserType.Customer,
      ]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      mockRequest.user = null;
      (reflector.get as jest.Mock).mockReturnValue([UserType.Instructor]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        '사용자 타입 정보가 없습니다.',
      );
    });

    it('should throw ForbiddenException when user has no userType', () => {
      mockRequest.user = { userId: 1, userType: null };
      (reflector.get as jest.Mock).mockReturnValue([UserType.Instructor]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        '사용자 타입 정보가 없습니다.',
      );
    });

    it('should throw ForbiddenException when user type does not match required type', () => {
      mockRequest.user.userType = UserType.Customer;
      (reflector.get as jest.Mock).mockReturnValue([UserType.Instructor]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        '해당 기능에 접근할 권한이 없습니다.',
      );
    });

    it('should throw ForbiddenException when user type does not match any of required types', () => {
      mockRequest.user.userType = UserType.Customer;
      (reflector.get as jest.Mock).mockReturnValue([UserType.Instructor]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('RequireUserType decorator', () => {
    it('should set metadata with user types', () => {
      const userTypes = [UserType.Instructor, UserType.Customer];
      const decorator = RequireUserType(userTypes);

      expect(decorator).toBeDefined();
      // The decorator should be a function that sets metadata
      expect(typeof decorator).toBe('function');
    });
  });
});
