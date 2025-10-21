import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { ImageRepository } from './image.repository';
import {
  mockImage,
  MockImageRepository,
} from 'src/common/mocks/mock-image.repository';
import { AwsService } from 'src/common/aws/aws.service';

describe('ImageService', () => {
  let service: ImageService;
  let repository: ImageRepository;
  let awsService: AwsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        { provide: ImageRepository, useValue: MockImageRepository },
        {
          provide: AwsService,
          useValue: {
            uploadImageToS3: jest.fn(),
            deleteFileFromS3: jest.fn(),
            uploadQRCodeToS3: jest.fn(),
            getPresignedUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    repository = module.get<ImageRepository>(ImageRepository);
    awsService = module.get<AwsService>(AwsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createImage', () => {
    it('feedback에 넣을 image를 저장', async () => {
      const feedbackId = 1;
      const fileUrl = 'test_image_url';

      await service.createImage(feedbackId, fileUrl);

      expect(repository.createImage).toHaveBeenCalledWith(feedbackId, fileUrl);
    });
  });

  describe('getImagesByFeedbackId', () => {
    it('feedbackId에 해당하는 image를 return', async () => {
      const feedbackId = 1;

      (repository.getImagesByFeedbackId as jest.Mock).mockResolvedValue([
        mockImage,
      ]);

      const result = await service.getImagesByFeedbackId(feedbackId);

      expect(repository.getImagesByFeedbackId).toHaveBeenCalledWith(feedbackId);
      expect(result).toEqual([mockImage]);
    });
  });

  describe('deleteImagesByFeedbackId', () => {
    it('feedbackId에 해당하는 image 삭제', async () => {
      const feedbackId = 1;

      await service.deleteImagesByFeedbackId(feedbackId);

      expect(repository.deleteImagesByFeedbackId).toHaveBeenCalledWith(
        feedbackId,
      );
    });
  });

  describe('deleteImage', () => {
    it('image 삭제', async () => {
      const imageId = 1;

      await service.deleteImage(imageId);

      expect(repository.deleteImage).toHaveBeenCalledWith(imageId);
    });
  });

  describe('deleteFeedbackImageFromS3', () => {
    it('image URL로부터 S3 이미지 삭제', async () => {
      const fileURL =
        'https://just-swim-bucket.s3.ap-northeast-2.amazonaws.com/feedback/1/test-image.png';

      await service.deleteFeedbackImageFromS3({ fileURL });

      expect(awsService.deleteFileFromS3).toHaveBeenCalledWith(
        'feedback/1/test-image.png',
      );
    });
  });

  // Community 관련 테스트
  describe('createCommunityFile', () => {
    it('community에 image를 저장', async () => {
      const communityId = 1;
      const fileUrl = 'https://s3.amazonaws.com/community/1/test-image.jpg';
      const fileType = 'image';
      const fileName = 'test-image.jpg';
      const fileSize = 1024000;

      (repository.createCommunityImage as jest.Mock).mockResolvedValue({
        imageId: 1,
        imagePath: fileUrl,
      });

      await service.createCommunityFile(
        communityId,
        fileUrl,
        fileType,
        fileName,
        fileSize,
      );

      expect(repository.createCommunityImage).toHaveBeenCalledWith(
        communityId,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        undefined,
        undefined,
      );
    });

    it('community에 video를 저장 (썸네일 포함)', async () => {
      const communityId = 1;
      const fileUrl = 'https://s3.amazonaws.com/community/1/test-video.mp4';
      const fileType = 'video';
      const fileName = 'test-video.mp4';
      const fileSize = 5242880;
      const duration = '120';
      const thumbnailPath =
        'https://s3.amazonaws.com/community/1/test-video-thumb.jpg';

      (repository.createCommunityImage as jest.Mock).mockResolvedValue({
        imageId: 1,
        imagePath: fileUrl,
      });

      await service.createCommunityFile(
        communityId,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        duration,
        thumbnailPath,
      );

      expect(repository.createCommunityImage).toHaveBeenCalledWith(
        communityId,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        duration,
        thumbnailPath,
      );
    });
  });

  describe('getFilesByCommunityId', () => {
    it('communityId에 해당하는 files를 return', async () => {
      const communityId = 1;
      const mockFiles = [
        {
          ...mockImage,
          fileType: 'image',
        },
        {
          imageId: 2,
          imagePath: 'https://s3.amazonaws.com/video.mp4',
          fileType: 'video',
          duration: '120',
          thumbnailPath: 'https://s3.amazonaws.com/video-thumb.jpg',
        },
      ];

      (repository.getImagesByCommunityId as jest.Mock).mockResolvedValue(
        mockFiles,
      );

      const result = await service.getFilesByCommunityId(communityId);

      expect(repository.getImagesByCommunityId).toHaveBeenCalledWith(
        communityId,
      );
      expect(result).toEqual(mockFiles);
    });
  });

  describe('deleteFilesByCommunityId', () => {
    it('communityId에 해당하는 files 삭제', async () => {
      const communityId = 1;

      (repository.deleteImagesByCommunityId as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.deleteFilesByCommunityId(communityId);

      expect(repository.deleteImagesByCommunityId).toHaveBeenCalledWith(
        communityId,
      );
    });
  });
});
