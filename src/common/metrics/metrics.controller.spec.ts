import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: MetricsService;

  const mockMetricsService = {
    getAllMetrics: jest.fn(),
    getApiMetrics: jest.fn(),
    getDatabaseMetrics: jest.fn(),
    getSystemMetrics: jest.fn(),
    getEndpointMetrics: jest.fn(),
    resetMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllMetrics', () => {
    it('should return all metrics', async () => {
      const mockMetrics = {
        api: {
          totalRequests: 100,
          successfulRequests: 95,
          failedRequests: 5,
          averageResponseTime: 150.5,
          requestsPerMinute: 10.5,
          errorRate: 5.0,
        },
        database: {
          totalQueries: 500,
          slowQueries: 25,
          averageQueryTime: 75.2,
          connectionPoolUsage: 0.3,
        },
        system: {
          memoryUsage: {
            rss: 50000000,
            heapTotal: 30000000,
            heapUsed: 20000000,
            external: 1000000,
          },
          cpuUsage: 0.5,
          uptime: 3600,
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      mockMetricsService.getAllMetrics.mockReturnValue(mockMetrics);

      const result = await controller.getAllMetrics();

      expect(result).toEqual(mockMetrics);
      expect(service.getAllMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getApiMetrics', () => {
    it('should return API metrics', async () => {
      const mockApiMetrics = {
        totalRequests: 100,
        successfulRequests: 95,
        failedRequests: 5,
        averageResponseTime: 150.5,
        requestsPerMinute: 10.5,
        errorRate: 5.0,
      };

      mockMetricsService.getApiMetrics.mockReturnValue(mockApiMetrics);

      const result = await controller.getApiMetrics();

      expect(result).toEqual(mockApiMetrics);
      expect(service.getApiMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDatabaseMetrics', () => {
    it('should return database metrics', async () => {
      const mockDbMetrics = {
        totalQueries: 500,
        slowQueries: 25,
        averageQueryTime: 75.2,
        connectionPoolUsage: 0.3,
      };

      mockMetricsService.getDatabaseMetrics.mockReturnValue(mockDbMetrics);

      const result = await controller.getDatabaseMetrics();

      expect(result).toEqual(mockDbMetrics);
      expect(service.getDatabaseMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics', async () => {
      const mockSystemMetrics = {
        memoryUsage: {
          rss: 50000000,
          heapTotal: 30000000,
          heapUsed: 20000000,
          external: 1000000,
        },
        cpuUsage: 0.5,
        uptime: 3600,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockMetricsService.getSystemMetrics.mockReturnValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      expect(result).toEqual(mockSystemMetrics);
      expect(service.getSystemMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEndpointMetrics', () => {
    it('should return endpoint metrics', async () => {
      const mockEndpointMetrics = {
        endpoint: '/api/users',
        method: 'GET',
        totalRequests: 10,
        successfulRequests: 9,
        failedRequests: 1,
        errorRate: 10.0,
      };

      mockMetricsService.getEndpointMetrics.mockReturnValue(
        mockEndpointMetrics,
      );

      const result = await controller.getEndpointMetrics('GET', '/api/users');

      expect(result).toEqual(mockEndpointMetrics);
      expect(service.getEndpointMetrics).toHaveBeenCalledWith(
        '/api/users',
        'GET',
      );
    });
  });

  describe('resetMetrics', () => {
    it('should reset metrics and return success message', async () => {
      mockMetricsService.resetMetrics.mockReturnValue(undefined);

      const result = await controller.resetMetrics();

      expect(result).toEqual({ message: '메트릭이 초기화되었습니다.' });
      expect(service.resetMetrics).toHaveBeenCalledTimes(1);
    });
  });
});
