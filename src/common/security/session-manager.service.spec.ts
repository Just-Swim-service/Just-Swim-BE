import { Test, TestingModule } from '@nestjs/testing';
import {
  SessionManagerService,
  ActiveSession,
} from './session-manager.service';
import { SecurityLoggerService } from './security-logger.service';

describe('SessionManagerService', () => {
  let service: SessionManagerService;
  let securityLogger: SecurityLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionManagerService,
        {
          provide: SecurityLoggerService,
          useValue: {
            logSuspiciousActivity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionManagerService>(SessionManagerService);
    securityLogger = module.get<SecurityLoggerService>(SecurityLoggerService);
  });

  afterEach(() => {
    // 테스트 후 정리
    service.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new session', () => {
      const sessionId = service.createSession(
        123,
        'instructor',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(sessionId).toBeDefined();
      expect(sessionId).toContain('123_');
    });

    it('should limit sessions per user', () => {
      // Create 4 sessions for the same user (limit is 3)
      const sessionIds = [];
      for (let i = 0; i < 4; i++) {
        const sessionId = service.createSession(
          123,
          'instructor',
          '192.168.1.1',
          'Mozilla/5.0',
        );
        sessionIds.push(sessionId);

        // 각 세션 생성 후 상태 확인
        const currentActiveSessions = service.getActiveSessions(123);
        const currentCount = service.getActiveSessionCount(123);
        console.log(
          `After session ${i + 1}: activeSessions=${currentActiveSessions.length}, count=${currentCount}`,
        );
      }

      // getActiveSessions는 isActive가 true인 세션만 반환
      const activeSessions = service.getActiveSessions(123);
      console.log(
        `Final activeSessions:`,
        activeSessions.map((s) => ({ id: s.sessionId, isActive: s.isActive })),
      );
      expect(activeSessions.length).toBe(3); // Should be limited to 3

      // getActiveSessionCount도 이제 isActive를 확인함
      const activeCount = service.getActiveSessionCount(123);
      expect(activeCount).toBe(3); // Should be limited to 3
    });
  });

  describe('validateSession', () => {
    let sessionId: string;

    beforeEach(() => {
      sessionId = service.createSession(
        123,
        'instructor',
        '192.168.1.1',
        'Mozilla/5.0',
      );
    });

    it('should validate active session', () => {
      const isValid = service.validateSession(sessionId, 123);
      expect(isValid).toBe(true);
    });

    it('should reject invalid session ID', () => {
      const isValid = service.validateSession('invalid-session-id', 123);
      expect(isValid).toBe(false);
    });

    it('should reject session with wrong user ID', () => {
      const logSpy = jest.spyOn(securityLogger, 'logSuspiciousActivity');

      const isValid = service.validateSession(sessionId, 456);
      expect(isValid).toBe(false);
      expect(logSpy).toHaveBeenCalledWith(
        expect.any(Object),
        'Session user ID mismatch',
        456,
        undefined,
        expect.objectContaining({
          sessionId,
          expectedUserId: 456,
          actualUserId: 123,
        }),
      );
    });

    it('should reject inactive session', () => {
      service.invalidateSession(sessionId);
      const isValid = service.validateSession(sessionId, 123);
      expect(isValid).toBe(false);
    });
  });

  describe('invalidateSession', () => {
    it('should invalidate session', () => {
      const sessionId = service.createSession(
        123,
        'instructor',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(service.getActiveSessionCount(123)).toBe(1);

      service.invalidateSession(sessionId);

      expect(service.getActiveSessionCount(123)).toBe(0);
    });

    it('should handle invalidating non-existent session', () => {
      expect(() => {
        service.invalidateSession('non-existent-session');
      }).not.toThrow();
    });
  });

  describe('invalidateAllUserSessions', () => {
    it('should invalidate all sessions for a user', () => {
      // Create multiple sessions
      service.createSession(123, 'instructor', '192.168.1.1', 'Mozilla/5.0');
      service.createSession(123, 'instructor', '192.168.1.2', 'Chrome/5.0');

      expect(service.getActiveSessionCount(123)).toBe(2);

      service.invalidateAllUserSessions(123);

      expect(service.getActiveSessionCount(123)).toBe(0);
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions for user', () => {
      const sessionId1 = service.createSession(
        123,
        'instructor',
        '192.168.1.1',
        'Mozilla/5.0',
      );
      const sessionId2 = service.createSession(
        123,
        'instructor',
        '192.168.1.2',
        'Chrome/5.0',
      );

      const sessions = service.getActiveSessions(123);
      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.sessionId)).toContain(sessionId1);
      expect(sessions.map((s) => s.sessionId)).toContain(sessionId2);
    });

    it('should return empty array for user with no sessions', () => {
      const sessions = service.getActiveSessions(999);
      expect(sessions).toHaveLength(0);
    });
  });

  describe('detectSuspiciousActivity', () => {
    let sessionId: string;

    beforeEach(() => {
      sessionId = service.createSession(
        123,
        'instructor',
        '192.168.1.1',
        'Mozilla/5.0',
      );
    });

    it('should detect IP address change', () => {
      const logSpy = jest.spyOn(securityLogger, 'logSuspiciousActivity');

      const isSuspicious = service.detectSuspiciousActivity(
        sessionId,
        '192.168.1.2', // Different IP
        'Mozilla/5.0',
      );

      expect(isSuspicious).toBe(true);
      expect(logSpy).toHaveBeenCalledWith(
        expect.any(Object),
        'IP address changed',
        123,
        'instructor',
        expect.objectContaining({
          sessionId,
          oldIp: '192.168.1.1',
          newIp: '192.168.1.2',
        }),
      );
    });

    it('should detect User-Agent change', () => {
      const logSpy = jest.spyOn(securityLogger, 'logSuspiciousActivity');

      const isSuspicious = service.detectSuspiciousActivity(
        sessionId,
        '192.168.1.1',
        'Chrome/5.0', // Different User-Agent
      );

      expect(isSuspicious).toBe(true);
      expect(logSpy).toHaveBeenCalledWith(
        expect.any(Object),
        'User-Agent changed',
        123,
        'instructor',
        expect.objectContaining({
          sessionId,
          oldUserAgent: 'Mozilla/5.0',
          newUserAgent: 'Chrome/5.0',
        }),
      );
    });

    it('should not detect suspicious activity for same IP and User-Agent', () => {
      const isSuspicious = service.detectSuspiciousActivity(
        sessionId,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(isSuspicious).toBe(false);
    });

    it('should return false for non-existent session', () => {
      const isSuspicious = service.detectSuspiciousActivity(
        'non-existent-session',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(isSuspicious).toBe(false);
    });
  });

  describe('getSessionStats', () => {
    it('should return correct session statistics', () => {
      // Create sessions for different users
      service.createSession(123, 'instructor', '192.168.1.1', 'Mozilla/5.0');
      service.createSession(123, 'instructor', '192.168.1.2', 'Chrome/5.0');
      service.createSession(456, 'customer', '192.168.1.3', 'Safari/5.0');

      const stats = service.getSessionStats();

      expect(stats.totalActiveSessions).toBe(3);
      expect(stats.uniqueUsers).toBe(2);
      expect(stats.averageSessionsPerUser).toBe(1.5);
    });

    it('should return zero stats when no sessions', () => {
      const stats = service.getSessionStats();

      expect(stats.totalActiveSessions).toBe(0);
      expect(stats.uniqueUsers).toBe(0);
      expect(stats.averageSessionsPerUser).toBe(0);
    });
  });

  describe('getAllSessions', () => {
    it('should return all active sessions', () => {
      service.createSession(123, 'instructor', '192.168.1.1', 'Mozilla/5.0');
      service.createSession(456, 'customer', '192.168.1.2', 'Chrome/5.0');

      const allSessions = service.getAllSessions();
      expect(allSessions).toHaveLength(2);
      expect(allSessions.every((s) => s.isActive)).toBe(true);
    });
  });
});
