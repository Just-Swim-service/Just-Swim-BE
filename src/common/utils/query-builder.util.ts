import { SelectQueryBuilder } from 'typeorm';

export class QueryBuilderUtil {
  /**
   * 안전한 WHERE 조건 추가
   * @param queryBuilder QueryBuilder 인스턴스
   * @param condition 조건문
   * @param parameters 파라미터 객체
   */
  static addSafeWhere(
    queryBuilder: SelectQueryBuilder<any>,
    condition: string,
    parameters: Record<string, any> = {},
  ): SelectQueryBuilder<any> {
    // SQL Injection 방지를 위한 파라미터 검증
    const sanitizedParameters = this.sanitizeParameters(parameters);

    return queryBuilder.andWhere(condition, sanitizedParameters);
  }

  /**
   * 안전한 ORDER BY 추가
   * @param queryBuilder QueryBuilder 인스턴스
   * @param sortBy 정렬할 컬럼
   * @param direction 정렬 방향 (ASC/DESC)
   */
  static addSafeOrderBy(
    queryBuilder: SelectQueryBuilder<any>,
    sortBy: string,
    direction: 'ASC' | 'DESC' = 'ASC',
  ): SelectQueryBuilder<any> {
    // 허용된 컬럼명만 사용
    const allowedColumns = this.getAllowedColumns();
    if (!allowedColumns.includes(sortBy)) {
      throw new Error(`Invalid sort column: ${sortBy}`);
    }

    return queryBuilder.orderBy(sortBy, direction);
  }

  /**
   * 안전한 LIMIT/OFFSET 추가
   * @param queryBuilder QueryBuilder 인스턴스
   * @param limit 제한 개수
   * @param offset 오프셋
   */
  static addSafePagination(
    queryBuilder: SelectQueryBuilder<any>,
    limit: number,
    offset: number = 0,
  ): SelectQueryBuilder<any> {
    // 최대 제한 설정
    const maxLimit = 100;
    const safeLimit = Math.min(Math.max(1, limit), maxLimit);
    const safeOffset = Math.max(0, offset);

    return queryBuilder.limit(safeLimit).offset(safeOffset);
  }

  /**
   * 문자열 sanitization
   * @param str 원본 문자열
   * @returns 정리된 문자열
   */
  private static sanitizeString(str: string): string {
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // script 태그 제거
      .replace(/<[^>]*>/g, '') // 모든 HTML 태그 제거
      .replace(/[<>'"]/g, '') // 특수 문자 제거
      .replace(/javascript:/gi, '') // javascript: 제거
      .replace(/on\w+\s*=/gi, ''); // 이벤트 핸들러 제거
  }

  /**
   * 파라미터 검증 및 정리
   * @param parameters 원본 파라미터
   * @returns 정리된 파라미터
   */
  private static sanitizeParameters(
    parameters: Record<string, any>,
  ): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (value === null || value === undefined) {
        continue;
      }

      // 문자열인 경우 특수 문자 제거
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 허용된 컬럼명 목록
   * @returns 허용된 컬럼명 배열
   */
  private static getAllowedColumns(): string[] {
    return [
      'userId',
      'userName',
      'userEmail',
      'userCreatedAt',
      'userUpdatedAt',
      'lectureId',
      'lectureTitle',
      'lectureDate',
      'lectureCreatedAt',
      'lectureUpdatedAt',
      'feedbackId',
      'feedbackContent',
      'feedbackDate',
      'feedbackCreatedAt',
      'feedbackUpdatedAt',
      'instructorId',
      'instructorName',
      'instructorCreatedAt',
      'instructorUpdatedAt',
    ];
  }

  /**
   * 검색 조건 안전하게 추가
   * @param queryBuilder QueryBuilder 인스턴스
   * @param searchTerm 검색어
   * @param searchFields 검색할 필드들
   */
  static addSafeSearch(
    queryBuilder: SelectQueryBuilder<any>,
    searchTerm: string,
    searchFields: string[],
  ): SelectQueryBuilder<any> {
    if (!searchTerm || searchTerm.trim() === '') {
      return queryBuilder;
    }

    const sanitizedTerm = this.sanitizeString(searchTerm).trim();
    if (sanitizedTerm === '') {
      return queryBuilder;
    }

    const conditions = searchFields
      .filter((field) => this.getAllowedColumns().includes(field))
      .map((field) => `${field} LIKE :searchTerm`)
      .join(' OR ');

    if (conditions) {
      queryBuilder.andWhere(`(${conditions})`, {
        searchTerm: `%${sanitizedTerm}%`,
      });
    }

    return queryBuilder;
  }
}
