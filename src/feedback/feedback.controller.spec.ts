import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import {
  MockFeedbackRepository,
  MockFeedbackTargetRepository,
} from './feedback.service.spec';
import { FeedbackService } from './feedback.service';

class MockFeedbackService {
  getAllFeedbackByInstructor = jest.fn();
  getFeedbackById = jest.fn();
  createFeedback = jest.fn();
  createFeedbackTarget = jest.fn();
  updateFeedback = jest.fn();
  updateFeedbackTarget = jest.fn();
  softDeleteFeedback = jest.fn();
  deleteFeedbackTarget = jest.fn();
}

const mockFeedback = new MockFeedbackRepository().mockFeedback;
const mockFeedbackTarget = new MockFeedbackTargetRepository()
  .mockFeedbackTarget;

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let feedbackService: MockFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [{ provide: FeedbackService, useClass: MockFeedbackService }],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    feedbackService = module.get<FeedbackService, MockFeedbackService>(
      FeedbackService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
