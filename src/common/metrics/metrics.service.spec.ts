import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordRequest', () => {
    it('should record successful request', () => {
      service.recordRequest('/api/users', 'GET', 100, true);

      const metrics = service.getApiMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
    });

    it('should record failed request', () => {
      service.recordRequest('/api/users', 'GET', 200, false);

      const metrics = service.getApiMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
    });

    it('should calculate average response time', () => {
      service.recordRequest('/api/users', 'GET', 100, true);
      service.recordRequest('/api/users', 'GET', 200, true);
      service.recordRequest('/api/users', 'GET', 300, true);

      const metrics = service.getApiMetrics();
      expect(metrics.averageResponseTime).toBe(200);
    });

    it('should calculate error rate', () => {
      service.recordRequest('/api/users', 'GET', 100, true);
      service.recordRequest('/api/users', 'GET', 200, true);
      service.recordRequest('/api/users', 'GET', 300, false);

      const metrics = service.getApiMetrics();
      expect(metrics.errorRate).toBe(33.33);
    });
  });

  describe('recordQuery', () => {
    it('should record query time', () => {
      service.recordQuery(50, 'SELECT * FROM users');
      service.recordQuery(150, 'SELECT * FROM lectures');

      const metrics = service.getDatabaseMetrics();
      expect(metrics.totalQueries).toBe(2);
      expect(metrics.averageQueryTime).toBe(100);
    });

    it('should identify slow queries', () => {
      service.recordQuery(500, 'SELECT * FROM users');
      service.recordQuery(1500, 'SELECT * FROM lectures');
      service.recordQuery(2000, 'SELECT * FROM feedback');

      const metrics = service.getDatabaseMetrics();
      expect(metrics.slowQueries).toBe(2);
    });
  });

  describe('getApiMetrics', () => {
    it('should return correct API metrics', () => {
      service.recordRequest('/api/users', 'GET', 100, true);
      service.recordRequest('/api/users', 'POST', 200, true);
      service.recordRequest('/api/lectures', 'GET', 150, false);

      const metrics = service.getApiMetrics();

      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.averageResponseTime).toBe(150);
      expect(metrics.errorRate).toBe(33.33);
    });
  });

  describe('getDatabaseMetrics', () => {
    it('should return correct database metrics', () => {
      service.recordQuery(100, 'SELECT * FROM users');
      service.recordQuery(200, 'SELECT * FROM lectures');
      service.recordQuery(1500, 'SELECT * FROM feedback');

      const metrics = service.getDatabaseMetrics();

      expect(metrics.totalQueries).toBe(3);
      expect(metrics.slowQueries).toBe(1);
      expect(metrics.averageQueryTime).toBe(600);
    });
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics', () => {
      const metrics = service.getSystemMetrics();

      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
      expect(metrics.timestamp).toBeDefined();
    });
  });

  describe('getEndpointMetrics', () => {
    it('should return endpoint specific metrics', () => {
      service.recordRequest('/api/users', 'GET', 100, true);
      service.recordRequest('/api/users', 'GET', 200, true);
      service.recordRequest('/api/users', 'GET', 150, false);

      const metrics = service.getEndpointMetrics('/api/users', 'GET');

      expect(metrics.endpoint).toBe('/api/users');
      expect(metrics.method).toBe('GET');
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.errorRate).toBe(33.33);
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics', () => {
      service.recordRequest('/api/users', 'GET', 100, true);
      service.recordQuery(50, 'SELECT * FROM users');

      service.resetMetrics();

      const apiMetrics = service.getApiMetrics();
      const dbMetrics = service.getDatabaseMetrics();

      expect(apiMetrics.totalRequests).toBe(0);
      expect(dbMetrics.totalQueries).toBe(0);
    });
  });
});
