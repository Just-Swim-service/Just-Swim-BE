import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { SkipAuth } from '../../auth/decorator/skip-auth.decorator';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @SkipAuth()
  @ApiOperation({
    summary: '전체 메트릭 조회',
    description: 'API, 데이터베이스, 시스템 메트릭을 모두 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '메트릭 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        api: {
          type: 'object',
          properties: {
            totalRequests: { type: 'number', example: 1000 },
            successfulRequests: { type: 'number', example: 950 },
            failedRequests: { type: 'number', example: 50 },
            averageResponseTime: { type: 'number', example: 150.5 },
            requestsPerMinute: { type: 'number', example: 10.5 },
            errorRate: { type: 'number', example: 5.0 },
          },
        },
        database: {
          type: 'object',
          properties: {
            totalQueries: { type: 'number', example: 5000 },
            slowQueries: { type: 'number', example: 25 },
            averageQueryTime: { type: 'number', example: 75.2 },
            connectionPoolUsage: { type: 'number', example: 0.3 },
          },
        },
        system: {
          type: 'object',
          properties: {
            memoryUsage: {
              type: 'object',
              properties: {
                rss: { type: 'number', example: 50000000 },
                heapTotal: { type: 'number', example: 30000000 },
                heapUsed: { type: 'number', example: 20000000 },
                external: { type: 'number', example: 1000000 },
              },
            },
            cpuUsage: { type: 'number', example: 0.5 },
            uptime: { type: 'number', example: 3600 },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  async getAllMetrics() {
    return this.metricsService.getAllMetrics();
  }

  @Get('api')
  @SkipAuth()
  @ApiOperation({
    summary: 'API 메트릭 조회',
    description: 'API 관련 메트릭만 조회합니다.',
  })
  async getApiMetrics() {
    return this.metricsService.getApiMetrics();
  }

  @Get('database')
  @SkipAuth()
  @ApiOperation({
    summary: '데이터베이스 메트릭 조회',
    description: '데이터베이스 관련 메트릭만 조회합니다.',
  })
  async getDatabaseMetrics() {
    return this.metricsService.getDatabaseMetrics();
  }

  @Get('system')
  @SkipAuth()
  @ApiOperation({
    summary: '시스템 메트릭 조회',
    description: '시스템 관련 메트릭만 조회합니다.',
  })
  async getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }

  @Get('endpoint/:method/:endpoint')
  @SkipAuth()
  @ApiOperation({
    summary: '특정 엔드포인트 메트릭 조회',
    description: '특정 엔드포인트의 메트릭을 조회합니다.',
  })
  @ApiParam({ name: 'method', description: 'HTTP 메서드', example: 'GET' })
  @ApiParam({
    name: 'endpoint',
    description: '엔드포인트 경로',
    example: '/api/users',
  })
  async getEndpointMetrics(
    @Param('method') method: string,
    @Param('endpoint') endpoint: string,
  ) {
    return this.metricsService.getEndpointMetrics(endpoint, method);
  }

  @Get('reset')
  @SkipAuth()
  @ApiOperation({
    summary: '메트릭 초기화',
    description: '모든 메트릭을 초기화합니다. (개발/테스트용)',
  })
  @ApiResponse({
    status: 200,
    description: '메트릭 초기화 완료',
  })
  async resetMetrics() {
    this.metricsService.resetMetrics();
    return { message: '메트릭이 초기화되었습니다.' };
  }
}
