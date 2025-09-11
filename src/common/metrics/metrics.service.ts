import { Injectable } from '@nestjs/common';

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
}

export interface DatabaseMetrics {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  connectionPoolUsage: number;
}

export interface SystemMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  uptime: number;
  timestamp: string;
}

@Injectable()
export class MetricsService {
  private requestCounts: Map<string, number> = new Map();
  private responseTimes: number[] = [];
  private errorCounts: Map<string, number> = new Map();
  private queryTimes: number[] = [];
  private slowQueryThreshold = 1000; // 1초
  private startTime = Date.now();

  // API 메트릭 수집
  recordRequest(
    endpoint: string,
    method: string,
    responseTime: number,
    success: boolean,
  ) {
    const key = `${method}:${endpoint}`;

    // 요청 수 증가
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

    // 응답 시간 기록
    this.responseTimes.push(responseTime);

    // 성공/실패 기록
    if (!success) {
      this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    }

    // 최근 1000개 응답 시간만 유지
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  // 데이터베이스 쿼리 메트릭 수집
  recordQuery(queryTime: number, query: string) {
    this.queryTimes.push(queryTime);

    // 최근 1000개 쿼리 시간만 유지
    if (this.queryTimes.length > 1000) {
      this.queryTimes = this.queryTimes.slice(-1000);
    }
  }

  // API 메트릭 조회
  getApiMetrics(): ApiMetrics {
    const totalRequests = Array.from(this.requestCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalErrors = Array.from(this.errorCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const successfulRequests = totalRequests - totalErrors;

    const averageResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((sum, time) => sum + time, 0) /
          this.responseTimes.length
        : 0;

    const uptimeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    const requestsPerMinute =
      uptimeMinutes > 0 ? totalRequests / uptimeMinutes : 0;

    const errorRate =
      totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests: totalErrors,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  // 데이터베이스 메트릭 조회
  getDatabaseMetrics(): DatabaseMetrics {
    const totalQueries = this.queryTimes.length;
    const slowQueries = this.queryTimes.filter(
      (time) => time > this.slowQueryThreshold,
    ).length;
    const averageQueryTime =
      totalQueries > 0
        ? this.queryTimes.reduce((sum, time) => sum + time, 0) / totalQueries
        : 0;

    return {
      totalQueries,
      slowQueries,
      averageQueryTime: Math.round(averageQueryTime * 100) / 100,
      connectionPoolUsage: 0, // 실제 구현에서는 connection pool 상태를 확인
    };
  }

  // 시스템 메트릭 조회
  getSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage().user / 1000000; // 마이크로초를 초로 변환

    return {
      memoryUsage,
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // 전체 메트릭 조회
  getAllMetrics() {
    return {
      api: this.getApiMetrics(),
      database: this.getDatabaseMetrics(),
      system: this.getSystemMetrics(),
    };
  }

  // 메트릭 초기화
  resetMetrics() {
    this.requestCounts.clear();
    this.responseTimes = [];
    this.errorCounts.clear();
    this.queryTimes = [];
    this.startTime = Date.now();
  }

  // 특정 엔드포인트 메트릭 조회
  getEndpointMetrics(endpoint: string, method: string) {
    const key = `${method}:${endpoint}`;
    const totalRequests = this.requestCounts.get(key) || 0;
    const errors = this.errorCounts.get(key) || 0;

    return {
      endpoint,
      method,
      totalRequests,
      successfulRequests: totalRequests - errors,
      failedRequests: errors,
      errorRate:
        totalRequests > 0
          ? Math.round((errors / totalRequests) * 100 * 100) / 100
          : 0,
    };
  }
}
