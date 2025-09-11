import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SecurityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // XSS 방지를 위한 헤더 검증
    this.validateHeaders(request);

    // 요청 크기 제한
    this.validateRequestSize(request);

    // 위험한 패턴 검사
    this.validateDangerousPatterns(request);

    return true;
  }

  private validateHeaders(request: Request): void {
    const userAgent = request.headers['user-agent'];

    // 비정상적인 User-Agent 패턴 검사
    if (userAgent && this.isSuspiciousUserAgent(userAgent)) {
      throw new BadRequestException('Invalid request headers');
    }
  }

  private validateRequestSize(request: Request): void {
    const contentLength = parseInt(request.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
      throw new BadRequestException('Request too large');
    }
  }

  private validateDangerousPatterns(request: Request): void {
    const url = request.url;
    const body = request.body;

    // SQL Injection 패턴 검사
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/i,
      /(\b(OR|AND)\s+".*"\s*=\s*".*")/i,
    ];

    // XSS 패턴 검사
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];

    // URL 검사
    if (this.containsPattern(url, [...sqlPatterns, ...xssPatterns])) {
      throw new BadRequestException('Invalid request pattern detected');
    }

    // Body 검사
    if (body && typeof body === 'object') {
      const bodyString = JSON.stringify(body);
      if (this.containsPattern(bodyString, [...sqlPatterns, ...xssPatterns])) {
        throw new BadRequestException('Invalid request data detected');
      }
    }
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /zap/i,
      /burp/i,
      /w3af/i,
      /havij/i,
      /acunetix/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }

  private containsPattern(text: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(text));
  }
}
