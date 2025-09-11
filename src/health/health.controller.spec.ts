import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    checkHealth: jest.fn(),
    getDetailedHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', async () => {
      // Arrange
      const mockHealthResult = {
        status: 'ok' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        memory: {
          rss: 50000000,
          heapTotal: 30000000,
          heapUsed: 20000000,
          external: 1000000,
        },
        database: {
          status: 'connected' as const,
          responseTime: 5,
        },
        environment: 'test',
        version: '1.0.0',
      };

      mockHealthService.checkHealth.mockResolvedValue(mockHealthResult);

      // Act
      const result = await controller.checkHealth();

      // Assert
      expect(result).toEqual(mockHealthResult);
      expect(service.checkHealth).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Health check failed');
      mockHealthService.checkHealth.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.checkHealth()).rejects.toThrow(
        'Health check failed',
      );
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information', async () => {
      // Arrange
      const mockDetailedHealth = {
        status: 'ok' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        memory: {
          rss: 50000000,
          heapTotal: 30000000,
          heapUsed: 20000000,
          external: 1000000,
        },
        database: {
          status: 'connected' as const,
          responseTime: 5,
        },
        environment: 'test',
        version: '1.0.0',
        services: {
          database: true,
        },
        metrics: {
          cpuUsage: 0.5,
          diskUsage: 0.3,
        },
      };

      mockHealthService.getDetailedHealth.mockResolvedValue(mockDetailedHealth);

      // Act
      const result = await controller.getDetailedHealth();

      // Assert
      expect(result).toEqual(mockDetailedHealth);
      expect(service.getDetailedHealth).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors in detailed health', async () => {
      // Arrange
      const error = new Error('Detailed health check failed');
      mockHealthService.getDetailedHealth.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getDetailedHealth()).rejects.toThrow(
        'Detailed health check failed',
      );
    });
  });
});
