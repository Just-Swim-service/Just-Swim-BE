import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: DataSource;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy status when database is connected', async () => {
      // Arrange
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe('ok');
      expect(result.database.status).toBe('connected');
      expect(result.database.responseTime).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.memory).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(result.version).toBeDefined();
    });

    it('should return error status when database is disconnected', async () => {
      // Arrange
      mockDataSource.query.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe('error');
      expect(result.database.status).toBe('disconnected');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.memory).toBeDefined();
    });

    it('should handle database query timeout', async () => {
      // Arrange
      mockDataSource.query.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 100),
          ),
      );

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe('error');
      expect(result.database.status).toBe('disconnected');
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information', async () => {
      // Arrange
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);

      // Act
      const result = await service.getDetailedHealth();

      // Assert
      expect(result.status).toBe('ok');
      expect(result.services.database).toBe(true);
      expect(result.metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(result.metrics.diskUsage).toBeGreaterThanOrEqual(0);
    });

    it('should return error status in detailed health when database fails', async () => {
      // Arrange
      mockDataSource.query.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.getDetailedHealth();

      // Assert
      expect(result.status).toBe('error');
      expect(result.services.database).toBe(false);
    });
  });

  describe('checkDatabaseConnection', () => {
    it('should return true when database query succeeds', async () => {
      // Arrange
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);

      // Act
      const result = await service['checkDatabaseConnection']();

      // Assert
      expect(result).toBe(true);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database query fails', async () => {
      // Arrange
      mockDataSource.query.mockRejectedValue(new Error('Connection failed'));

      // Act
      const result = await service['checkDatabaseConnection']();

      // Assert
      expect(result).toBe(false);
    });
  });
});
