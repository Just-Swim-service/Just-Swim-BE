import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

export class TestUtils {
  static async createTestApp(module: any): Promise<INestApplication> {
    const moduleFixture: TestingModule =
      await Test.createTestingModule(module).compile();

    const app = moduleFixture.createNestApplication();

    // 전역 파이프 설정
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
    return app;
  }

  static async closeTestApp(app: INestApplication): Promise<void> {
    await app.close();
  }

  static async clearDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  static createMockUser(overrides: Partial<any> = {}) {
    return {
      userId: 1,
      userEmail: 'test@example.com',
      userName: 'Test User',
      userType: 'customer',
      userProfileImage: 'https://example.com/profile.jpg',
      userCreatedAt: new Date(),
      userUpdatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockInstructor(overrides: Partial<any> = {}) {
    return {
      instructorId: 1,
      instructorUserId: 1,
      instructorName: 'Test Instructor',
      instructorProfileImage: 'https://example.com/instructor.jpg',
      instructorCreatedAt: new Date(),
      instructorUpdatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockLecture(overrides: Partial<any> = {}) {
    return {
      lectureId: 1,
      lectureTitle: 'Test Lecture',
      lectureDescription: 'Test Description',
      lectureDate: '2024-01-01',
      lectureStartTime: '09:00',
      lectureEndTime: '10:00',
      lectureMaxMembers: 10,
      lectureCurrentMembers: 0,
      userId: 1,
      lectureCreatedAt: new Date(),
      lectureUpdatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockFeedback(overrides: Partial<any> = {}) {
    return {
      feedbackId: 1,
      feedbackContent: 'Great lecture!',
      feedbackDate: '2024-01-01',
      feedbackType: 'positive',
      feedbackLink: 'https://example.com/feedback',
      instructorUserId: 1,
      feedbackCreatedAt: new Date(),
      feedbackUpdatedAt: new Date(),
      ...overrides,
    };
  }
}
