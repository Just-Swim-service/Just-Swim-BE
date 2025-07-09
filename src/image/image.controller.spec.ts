import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ResponseService } from 'src/common/response/response.service';
import { DeleteImageDto } from './dto/delete-image.dto';
import { Response } from 'express';

describe('ImageController', () => {
  let controller: ImageController;
  let imageService: ImageService;
  let responseService: ResponseService;

  const mockImageService = {
    deleteFeedbackFileFromS3: jest.fn(),
  };

  const mockResponseService = {
    success: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        { provide: ImageService, useValue: mockImageService },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    imageService = module.get<ImageService>(ImageService);
    responseService = module.get<ResponseService>(ResponseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteImage', () => {
    it('should delete image by URL and return success response', async () => {
      const deleteImageDto: DeleteImageDto = {
        fileURL:
          'https://just-swim-bucket.s3.ap-northeast-2.amazonaws.com/feedback/1/test-image.png',
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      await controller.deleteImage(mockRes, deleteImageDto);

      expect(imageService.deleteFeedbackFileFromS3).toHaveBeenCalledWith(
        deleteImageDto,
      );
      expect(responseService.success).toHaveBeenCalledWith(
        mockRes,
        '파일 삭제 성공',
      );
    });
  });
});
