import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Request, Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { EditFeedbackDto } from './dto/edit-feedback.dto';
import { FeedbackType } from './enum/feedback-type.enum';
import { ResponseService } from 'src/common/response/response.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { mockFeedback } from 'src/common/mocks/mock-feedback.repository';

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

class MockResponseService {
  success = jest.fn();
  error = jest.fn();
  unauthorized = jest.fn();
  notFound = jest.fn();
  conflict = jest.fn();
  forbidden = jest.fn();
  internalServerError = jest.fn();
}

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let feedbackService: MockFeedbackService;
  let responseService: MockResponseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        { provide: FeedbackService, useClass: MockFeedbackService },
        { provide: ResponseService, useClass: MockResponseService },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    feedbackService = module.get<FeedbackService, MockFeedbackService>(
      FeedbackService,
    );
    responseService = module.get<ResponseService, MockResponseService>(
      ResponseService,
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

      feedbackService.getAllFeedbackByInstructor.mockResolvedValue([
        mockFeedback,
      ]);

      await controller.getAllFeedback(res as Response);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        'feedback 전체 조회 성공',
        [mockFeedback],
      );
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

      feedbackService.getFeedbackByPk.mockResolvedValue([mockFeedback]);

      await controller.getFeedbackDetail(res as Response, feedbackId);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        'feedback 상세 조회 성공',
        [mockFeedback],
      );
    });
  });

  describe('createFeedback', () => {
    it('instructor가 member에 해당하는 customer에게 feedback을 남긴다.', async () => {
      const feedbackDto: CreateFeedbackDto = {
        feedbackType: FeedbackType.Group,
        feedbackDate: '2024.04.22',
        feedbackLink: 'URL',
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackTarget: [
          { lectureId: 1, userIds: [2, 3] },
          { lectureId: 2, userIds: [4, 5, 13] },
        ],
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

      const files: Express.Multer.File[] = [];

      feedbackService.createFeedback.mockResolvedValue({
        feedbackId: mockFeedback.feedbackId,
      });

      await controller.createFeedback(res as Response, feedbackDto);

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        'feedback 생성 성공',
        {
          feedbackId: mockFeedback.feedbackId,
        },
      );
    });
  });

  describe('updateFeedback', () => {
    it('instructor가 feedbackId에 해당하는 feedback을 수정', async () => {
      const editFeedbackDto: EditFeedbackDto = {
        feedbackType: FeedbackType.Group,
        feedbackDate: '2024.04.22',
        feedbackLink: 'URL',
        feedbackContent:
          '회원님! 오늘 자세는 좋았으나 마지막 스퍼트가 부족해 보였어요 호흡하실 때에도 팔 각도를 조정해 주시면...',
        feedbackTarget: [
          { lectureId: 1, userIds: [2, 3] },
          { lectureId: 2, userIds: [4, 5, 13] },
        ],
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

      const files: Express.Multer.File[] = [];

      feedbackService.updateFeedback.mockResolvedValue(true);

      await controller.updateFeedback(
        res as Response,
        feedbackId,
        editFeedbackDto,
      );

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        'feedback 수정 성공',
      );
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

      expect(responseService.success).toHaveBeenCalledWith(
        res,
        'feedback 삭제 성공',
      );
    });
  });
});
