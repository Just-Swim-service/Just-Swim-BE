import { Injectable, Logger } from '@nestjs/common';
import { SecurityLoggerService } from './security-logger.service';

export interface ActiveSession {
  userId: number;
  userType: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

@Injectable()
export class SessionManagerService {
  private readonly logger = new Logger(SessionManagerService.name);
  private readonly activeSessions = new Map<string, ActiveSession>();
  private readonly userSessions = new Map<number, Set<string>>(); // userId -> Set of sessionIds
  private readonly maxSessionsPerUser = 3; // 사용자당 최대 동시 세션 수
  private readonly sessionTimeout = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly securityLogger: SecurityLoggerService) {
    // 주기적으로 만료된 세션 정리
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredSessions(),
      60 * 60 * 1000,
    ); // 1시간마다
  }

  /**
   * 서비스 정리 (테스트용)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 새 세션 생성
   */
  createSession(
    userId: number,
    userType: string,
    ipAddress: string,
    userAgent: string,
  ): string {
    const sessionId = this.generateSessionId(userId);

    // 기존 세션 수 확인
    let existingSessions = this.userSessions.get(userId) || new Set();

    if (existingSessions.size >= this.maxSessionsPerUser) {
      // 가장 오래된 세션 제거
      this.removeOldestSession(userId);
      // 제거 후 다시 가져오기
      existingSessions = this.userSessions.get(userId) || new Set();
    }

    const now = new Date();
    // 약간의 지연을 추가하여 loginTime을 다르게 설정
    const loginTime = new Date(now.getTime() + Math.random() * 1000);

    const session: ActiveSession = {
      userId,
      userType,
      sessionId,
      ipAddress,
      userAgent,
      loginTime,
      lastActivity: now,
      isActive: true,
    };

    this.activeSessions.set(sessionId, session);
    existingSessions.add(sessionId);
    this.userSessions.set(userId, existingSessions);

    this.logger.log(
      `New session created for user ${userId}: ${sessionId}, total sessions: ${existingSessions.size}`,
    );
    return sessionId;
  }

  /**
   * 세션 유효성 검증
   */
  validateSession(sessionId: string, userId: number): boolean {
    const session = this.activeSessions.get(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    if (session.userId !== userId) {
      this.securityLogger.logSuspiciousActivity(
        { url: '', method: 'SESSION_VALIDATION' } as any,
        'Session user ID mismatch',
        userId,
        undefined,
        { sessionId, expectedUserId: userId, actualUserId: session.userId },
      );
      return false;
    }

    // 세션 타임아웃 확인
    const now = new Date();
    if (now.getTime() - session.lastActivity.getTime() > this.sessionTimeout) {
      this.invalidateSession(sessionId);
      return false;
    }

    // 마지막 활동 시간 업데이트
    session.lastActivity = now;
    return true;
  }

  /**
   * 세션 무효화
   */
  invalidateSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);

      const userSessions = this.userSessions.get(session.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }

      this.logger.log(
        `Session invalidated: ${sessionId} for user ${session.userId}`,
      );
    }
  }

  /**
   * 사용자의 모든 세션 무효화
   */
  invalidateAllUserSessions(userId: number): void {
    const userSessions = this.userSessions.get(userId);
    if (userSessions) {
      for (const sessionId of userSessions) {
        this.invalidateSession(sessionId);
      }
      this.logger.log(`All sessions invalidated for user ${userId}`);
    }
  }

  /**
   * 사용자의 활성 세션 수 조회
   */
  getActiveSessionCount(userId: number): number {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) return 0;

    let activeCount = 0;
    for (const sessionId of userSessions) {
      const session = this.activeSessions.get(sessionId);
      if (session && session.isActive) {
        activeCount++;
      }
    }
    return activeCount;
  }

  /**
   * 사용자의 활성 세션 목록 조회
   */
  getActiveSessions(userId: number): ActiveSession[] {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) return [];

    const sessions: ActiveSession[] = [];
    for (const sessionId of userSessions) {
      const session = this.activeSessions.get(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  /**
   * 의심스러운 세션 활동 감지
   */
  detectSuspiciousActivity(
    sessionId: string,
    ipAddress: string,
    userAgent: string,
  ): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // IP 주소 변경 감지
    if (session.ipAddress !== ipAddress) {
      this.securityLogger.logSuspiciousActivity(
        { url: '', method: 'SESSION_CHECK' } as any,
        'IP address changed',
        session.userId,
        session.userType,
        {
          sessionId,
          oldIp: session.ipAddress,
          newIp: ipAddress,
        },
      );
      return true;
    }

    // User-Agent 변경 감지
    if (session.userAgent !== userAgent) {
      this.securityLogger.logSuspiciousActivity(
        { url: '', method: 'SESSION_CHECK' } as any,
        'User-Agent changed',
        session.userId,
        session.userType,
        {
          sessionId,
          oldUserAgent: session.userAgent,
          newUserAgent: userAgent,
        },
      );
      return true;
    }

    return false;
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(userId: number): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${userId}_${timestamp}_${random}`;
  }

  /**
   * 사용자의 가장 오래된 세션 제거
   */
  private removeOldestSession(userId: number): void {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions || userSessions.size === 0) {
      this.logger.log(`No sessions found for user ${userId}`);
      return;
    }

    this.logger.log(
      `Removing oldest session for user ${userId}, current sessions: ${userSessions.size}`,
    );

    let oldestSessionId: string | null = null;
    let oldestTime = new Date();

    for (const sessionId of userSessions) {
      const session = this.activeSessions.get(sessionId);
      if (session && session.loginTime < oldestTime) {
        oldestTime = session.loginTime;
        oldestSessionId = sessionId;
      }
    }

    if (oldestSessionId) {
      this.logger.log(
        `Removing oldest session ${oldestSessionId} for user ${userId}`,
      );
      this.invalidateSession(oldestSessionId);
      this.logger.log(
        `Removed oldest session ${oldestSessionId} for user ${userId}`,
      );
    } else {
      this.logger.log(`No valid session found to remove for user ${userId}`);
    }
  }

  /**
   * 만료된 세션 정리
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions) {
      if (
        now.getTime() - session.lastActivity.getTime() >
        this.sessionTimeout
      ) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.invalidateSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * 모든 세션 정보 조회 (관리자용)
   */
  getAllSessions(): ActiveSession[] {
    return Array.from(this.activeSessions.values()).filter(
      (session) => session.isActive,
    );
  }

  /**
   * 세션 통계 조회
   */
  getSessionStats(): {
    totalActiveSessions: number;
    uniqueUsers: number;
    averageSessionsPerUser: number;
  } {
    const totalActiveSessions = this.activeSessions.size;
    const uniqueUsers = this.userSessions.size;
    const averageSessionsPerUser =
      uniqueUsers > 0 ? totalActiveSessions / uniqueUsers : 0;

    return {
      totalActiveSessions,
      uniqueUsers,
      averageSessionsPerUser,
    };
  }
}
