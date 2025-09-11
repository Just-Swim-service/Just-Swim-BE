import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService, HealthCheckResult } from './health.service';
import { SkipAuth } from '../auth/decorator/skip-auth.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @SkipAuth()
  @ApiOperation({
    summary: '서비스 상태 확인',
    description: '서비스의 전반적인 상태를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '서비스가 정상적으로 동작 중',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'number', example: 50000000 },
            heapTotal: { type: 'number', example: 30000000 },
            heapUsed: { type: 'number', example: 20000000 },
            external: { type: 'number', example: 1000000 },
          },
        },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            responseTime: { type: 'number', example: 5 },
          },
        },
        environment: { type: 'string', example: 'production' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: '서비스가 비정상 상태',
  })
  async checkHealth(): Promise<HealthCheckResult> {
    return this.healthService.checkHealth();
  }

  @Get('detailed')
  @SkipAuth()
  @ApiOperation({
    summary: '상세 서비스 상태 확인',
    description: '서비스의 상세한 상태와 메트릭을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상세 서비스 상태 정보',
  })
  async getDetailedHealth() {
    return this.healthService.getDetailedHealth();
  }
}
