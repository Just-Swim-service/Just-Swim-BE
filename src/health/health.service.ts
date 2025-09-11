import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  environment: string;
  version: string;
}

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // 데이터베이스 연결 상태 확인
      const dbStatus = await this.checkDatabaseConnection();
      const dbResponseTime = Math.max(Date.now() - startTime, 1); // 최소 1ms 보장

      return {
        status: dbStatus ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: dbStatus ? 'connected' : 'disconnected',
          responseTime: dbResponseTime,
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'disconnected',
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      };
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDetailedHealth(): Promise<
    HealthCheckResult & {
      services: {
        database: boolean;
        redis?: boolean;
        s3?: boolean;
      };
      metrics: {
        cpuUsage: number;
        diskUsage: number;
      };
    }
  > {
    const basicHealth = await this.checkHealth();

    // 서비스별 상태 확인
    const services = {
      database: basicHealth.database.status === 'connected',
      // Redis나 S3 등 다른 서비스들도 여기에 추가 가능
    };

    // 시스템 메트릭 (간단한 구현)
    const metrics = {
      cpuUsage: process.cpuUsage().user / 1000000, // 마이크로초를 초로 변환
      diskUsage: 0, // 실제 구현에서는 diskusage 라이브러리 사용
    };

    return {
      ...basicHealth,
      services,
      metrics,
    };
  }
}
