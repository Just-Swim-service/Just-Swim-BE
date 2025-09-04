import { Transform } from 'class-transformer';

/**
 * XSS 공격을 방지하기 위한 입력값 정제 유틸리티
 */
export class SanitizationUtil {
  /**
   * HTML 태그를 제거하고 특수문자를 이스케이프
   */
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, (match) => {
        return match === '<' ? '&lt;' : '&gt;';
      })
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;');
  }

  /**
   * SQL Injection을 방지하기 위한 입력값 정제
   */
  static sanitizeSql(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/['"\\]/g, '') // 따옴표와 백슬래시 제거
      .replace(/--/g, '') // SQL 주석 제거
      .replace(/\/\*/g, '') // SQL 블록 주석 시작 제거
      .replace(/\*\//g, '') // SQL 블록 주석 끝 제거
      .replace(/;/g, '') // 세미콜론 제거
      .replace(/union/gi, '') // UNION 키워드 제거
      .replace(/select/gi, '') // SELECT 키워드 제거
      .replace(/insert/gi, '') // INSERT 키워드 제거
      .replace(/update/gi, '') // UPDATE 키워드 제거
      .replace(/delete/gi, '') // DELETE 키워드 제거
      .replace(/drop/gi, '') // DROP 키워드 제거
      .replace(/create/gi, '') // CREATE 키워드 제거
      .replace(/alter/gi, '') // ALTER 키워드 제거
      .replace(/exec/gi, '') // EXEC 키워드 제거
      .replace(/execute/gi, '') // EXECUTE 키워드 제거
      .trim();
  }

  /**
   * 일반적인 입력값 정제 (HTML + SQL)
   */
  static sanitize(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return this.sanitizeHtml(this.sanitizeSql(input));
  }

  /**
   * URL 입력값 정제
   */
  static sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:'];
    try {
      const url = new URL(input);
      if (!allowedProtocols.includes(url.protocol)) {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * 이메일 입력값 정제
   */
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // 이메일 형식 검증 및 정제
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = input.toLowerCase().trim();

    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * 숫자 입력값 정제
   */
  static sanitizeNumber(input: any): number | null {
    if (input === null || input === undefined || input === '') {
      return null;
    }

    const num = Number(input);
    return isNaN(num) ? null : num;
  }
}

/**
 * class-transformer용 sanitization 데코레이터
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return SanitizationUtil.sanitize(value);
    }
    return value;
  });
}

/**
 * HTML sanitization 전용 데코레이터
 */
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return SanitizationUtil.sanitizeHtml(value);
    }
    return value;
  });
}

/**
 * URL sanitization 전용 데코레이터
 */
export function SanitizeUrl() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return SanitizationUtil.sanitizeUrl(value);
    }
    return value;
  });
}

/**
 * 이메일 sanitization 전용 데코레이터
 */
export function SanitizeEmail() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return SanitizationUtil.sanitizeEmail(value);
    }
    return value;
  });
}
