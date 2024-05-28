import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { MockFeedbackRepository } from './feedback.service.spec';
import { FeedbackService } from './feedback.service';
import { Request, Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { FeedbackDto } from './dto/feedback.dto';
import { EditFeedbackDto } from './dto/editFeedback.dto';

class MockFeedbackService {
  getAllFeedbackByInstructor = jest.fn();
  getFeedbackByPk = jest.fn();
  createFeedback = jest.fn();
  createFeedbackTarget = jest.fn();
  updateFeedback = jest.fn();
  updateFeedbackTarget = jest.fn();
  softDeleteFeedback = jest.fn();
  deleteFeedbackTarget = jest.fn();
}

const mockFeedback = new MockFeedbackRepository().mockFeedback;

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let feedbackService: MockFeedbackService;

  beforeAll(async () => {
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

  describe('getAllFeedback', () => {
    it('개인의 feedback 전체를 조회', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      feedbackService.getAllFeedbackByInstructor.mockResolvedValue(
        mockFeedback,
      );

      await controller.getAllFeedback(res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockFeedback);
    });
  });

  describe('getFeedbackDetail', () => {
    it('feedback을 상세 조회', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const feedbackId = 1;

      feedbackService.getFeedbackByPk.mockResolvedValue(mockFeedback);

      await controller.getFeedbackDetail(res as Response, feedbackId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockFeedback);
    });
  });

  describe('createFeedback', () => {
    it('instructor가 member에 해당하는 customer에게 feedback을 남긴다.', async () => {
      const req: Partial<Request> = {
        body: { feedbackDto: FeedbackDto },
      };

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      feedbackService.createFeedback.mockResolvedValue(true);

      await controller.createFeedback(res as Response, req.body);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'feedback 생성 성공' });
    });
  });

  describe('updateFeedback', () => {
    it('instructor가 feedbackId에 해당하는 feedback을 수정', async () => {
      const req: Partial<Request> = {
        body: { editFeedbackDto: EditFeedbackDto },
      };

      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const feedbackId = 1;

      feedbackService.updateFeedback.mockResolvedValue(true);

      await controller.updateFeedback(res as Response, feedbackId, req.body);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'feedback 수정 성공' });
    });
  });

  describe('softDeleteFeedback', () => {
    it('instructor가 feedbackId에 해당하는 feedback을 삭제', async () => {
      const res: Partial<Response> = {
        locals: {
          user: {
            userId: 1,
            userType: 'instructor',
          },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const feedbackId = 1;

      feedbackService.deleteFeedbackTarget.mockResolvedValue(true);

      await controller.softDeleteFeedback(res as Response, feedbackId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'feedback 삭제 성공' });
    });
  });
});
