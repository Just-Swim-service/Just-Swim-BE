import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

export enum SecurityEventType {
  AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE',
  AUTHORIZATION_FAILURE = 'AUTHORIZATION_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_INPUT = 'SUSPICIOUS_INPUT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export interface SecurityLogData {
  eventType: SecurityEventType;
  userId?: number;
  userType?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  requestBody?: any;
  responseStatus?: number;
  errorMessage?: string;
  additionalData?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);

  /**
   * 보안 이벤트 로깅
   */
  logSecurityEvent(data: SecurityLogData): void {
    const logMessage = this.formatSecurityLog(data);

    // 보안 이벤트는 항상 WARN 레벨로 로깅
    this.logger.warn(logMessage);

    // 심각한 보안 이벤트는 ERROR 레벨로도 로깅
    if (this.isCriticalEvent(data.eventType)) {
      this.logger.error(`CRITICAL SECURITY EVENT: ${logMessage}`);
    }
  }

  /**
   * 인증 실패 로깅
   */
  logAuthenticationFailure(
    request: Request,
    errorMessage: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logSecurityEvent({
      eventType: SecurityEventType.AUTHENTICATION_FAILURE,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      endpoint: request.url,
      method: request.method,
      requestBody: this.sanitizeRequestBody(request.body),
      errorMessage,
      additionalData,
      timestamp: new Date(),
    });
  }

  /**
   * 권한 부족 로깅
   */
  logAuthorizationFailure(
    request: Request,
    userId: number,
    userType: string,
    errorMessage: string,
  ): void {
    this.logSecurityEvent({
      eventType: SecurityEventType.AUTHORIZATION_FAILURE,
      userId,
      userType,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      endpoint: request.url,
      method: request.method,
      requestBody: this.sanitizeRequestBody(request.body),
      errorMessage,
      timestamp: new Date(),
    });
  }

  /**
   * Rate Limit 초과 로깅
   */
  logRateLimitExceeded(
    request: Request,
    userId?: number,
    userType?: string,
  ): void {
    this.logSecurityEvent({
      eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
      userId,
      userType,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      endpoint: request.url,
      method: request.method,
      requestBody: this.sanitizeRequestBody(request.body),
      errorMessage: 'Rate limit exceeded',
      timestamp: new Date(),
    });
  }

  /**
   * 의심스러운 입력 로깅
   */
  logSuspiciousInput(
    request: Request,
    inputData: any,
    inputType: 'SQL_INJECTION' | 'XSS' | 'SUSPICIOUS',
    userId?: number,
  ): void {
    const eventType =
      inputType === 'SQL_INJECTION'
        ? SecurityEventType.SQL_INJECTION_ATTEMPT
        : inputType === 'XSS'
          ? SecurityEventType.XSS_ATTEMPT
          : SecurityEventType.SUSPICIOUS_INPUT;

    this.logSecurityEvent({
      eventType,
      userId,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      endpoint: request.url,
      method: request.method,
      requestBody: this.sanitizeRequestBody(request.body),
      additionalData: {
        suspiciousInput: inputData,
        inputType,
      },
      timestamp: new Date(),
    });
  }

  /**
   * 토큰 관련 보안 이벤트 로깅
   */
  logTokenEvent(
    request: Request,
    eventType:
      | SecurityEventType.INVALID_TOKEN
      | SecurityEventType.TOKEN_EXPIRED,
    errorMessage: string,
    userId?: number,
  ): void {
    this.logSecurityEvent({
      eventType,
      userId,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      endpoint: request.url,
      method: request.method,
      requestBody: this.sanitizeRequestBody(request.body),
      errorMessage,
      timestamp: new Date(),
    });
  }

  /**
   * 의심스러운 활동 로깅
   */
  logSuspiciousActivity(
    request: Request,
    activity: string,
    userId?: number,
    userType?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logSecurityEvent({
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId,
      userType,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      endpoint: request.url,
      method: request.method,
      requestBody: this.sanitizeRequestBody(request.body),
      additionalData: {
        activity,
        ...additionalData,
      },
      timestamp: new Date(),
    });
  }

  /**
   * 클라이언트 IP 주소 추출
   */
  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.connection as any)?.socket?.remoteAddress ||
      'Unknown'
    );
  }

  /**
   * 요청 본문 정제 (민감한 정보 제거)
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };

    // 민감한 정보 제거
    delete sanitized.password;
    delete sanitized.refreshToken;
    delete sanitized.accessToken;
    delete sanitized.authorization;

    return sanitized;
  }

  /**
   * 보안 로그 포맷팅
   */
  private formatSecurityLog(data: SecurityLogData): string {
    const baseInfo = `[SECURITY] ${data.eventType} - IP: ${data.ipAddress} - ${data.method} ${data.endpoint}`;
    const userInfo = data.userId
      ? ` - User: ${data.userId} (${data.userType})`
      : '';
    const errorInfo = data.errorMessage ? ` - Error: ${data.errorMessage}` : '';
    const additionalInfo = data.additionalData
      ? ` - Data: ${JSON.stringify(data.additionalData)}`
      : '';

    return `${baseInfo}${userInfo}${errorInfo}${additionalInfo}`;
  }

  /**
   * 심각한 보안 이벤트 판단
   */
  private isCriticalEvent(eventType: SecurityEventType): boolean {
    const criticalEvents = [
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
    ];

    return criticalEvents.includes(eventType);
  }
}

