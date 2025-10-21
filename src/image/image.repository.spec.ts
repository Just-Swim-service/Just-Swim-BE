import { Test, TestingModule } from '@nestjs/testing';
import { ImageRepository } from './image.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Image } from './entity/image.entity';
import { Repository } from 'typeorm';

describe('ImageRepository', () => {
  let imageRepository: ImageRepository;
  let repo: jest.Mocked<Repository<Image>>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageRepository,
        {
          provide: getRepositoryToken(Image),
          useValue: mockRepo,
        },
      ],
    }).compile();

    imageRepository = module.get<ImageRepository>(ImageRepository);
    repo = module.get(getRepositoryToken(Image));
  });

  it('should create image for given feedbackId', async () => {
    const created = { imageId: 1, imagePath: 'imageURL' } as Image;
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await imageRepository.createImage(1, 'imageURL');
    expect(repo.create).toHaveBeenCalledWith({
      feedback: { feedbackId: 1 },
      imagePath: 'imageURL',
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('should get images by feedbackId', async () => {
    const images = [{ imageId: 1 }, { imageId: 2 }] as Image[];
    repo.find.mockResolvedValue(images);

    const result = await imageRepository.getImagesByFeedbackId(1);
    expect(repo.find).toHaveBeenCalledWith({
      where: { feedback: { feedbackId: 1 } },
    });
    expect(result).toEqual(images);
  });

  it('should delete image by imageId', async () => {
    await imageRepository.deleteImage(1);
    expect(repo.delete).toHaveBeenCalledWith({ imageId: 1 });
  });

  it('should delete images by feedbackId', async () => {
    await imageRepository.deleteImagesByFeedbackId(1);
    expect(repo.delete).toHaveBeenCalledWith({
      feedback: { feedbackId: 1 },
    });
  });

  // Community 관련 테스트
  it('should create image for given communityId', async () => {
    const created = {
      imageId: 1,
      imagePath: 'https://s3.amazonaws.com/community/1/image.jpg',
      fileType: 'image',
      fileName: 'image.jpg',
      fileSize: 1024000,
    } as Image;
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await imageRepository.createCommunityImage(
      1,
      'https://s3.amazonaws.com/community/1/image.jpg',
      'image',
      'image.jpg',
      1024000,
    );
    expect(repo.create).toHaveBeenCalledWith({
      community: { communityId: 1 },
      imagePath: 'https://s3.amazonaws.com/community/1/image.jpg',
      fileType: 'image',
      fileName: 'image.jpg',
      fileSize: 1024000,
      duration: undefined,
      thumbnailPath: undefined,
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('should create video with thumbnail for given communityId', async () => {
    const created = {
      imageId: 1,
      imagePath: 'https://s3.amazonaws.com/community/1/video.mp4',
      fileType: 'video',
      fileName: 'video.mp4',
      fileSize: 5242880,
      duration: '120',
      thumbnailPath: 'https://s3.amazonaws.com/community/1/video-thumb.jpg',
    } as Image;
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await imageRepository.createCommunityImage(
      1,
      'https://s3.amazonaws.com/community/1/video.mp4',
      'video',
      'video.mp4',
      5242880,
      '120',
      'https://s3.amazonaws.com/community/1/video-thumb.jpg',
    );
    expect(repo.create).toHaveBeenCalledWith({
      community: { communityId: 1 },
      imagePath: 'https://s3.amazonaws.com/community/1/video.mp4',
      fileType: 'video',
      fileName: 'video.mp4',
      fileSize: 5242880,
      duration: '120',
      thumbnailPath: 'https://s3.amazonaws.com/community/1/video-thumb.jpg',
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('should get images by communityId', async () => {
    const images = [
      { imageId: 1, fileType: 'image' },
      { imageId: 2, fileType: 'video' },
    ] as Image[];
    repo.find.mockResolvedValue(images);

    const result = await imageRepository.getImagesByCommunityId(1);
    expect(repo.find).toHaveBeenCalledWith({
      where: { community: { communityId: 1 } },
    });
    expect(result).toEqual(images);
  });

  it('should delete images by communityId', async () => {
    await imageRepository.deleteImagesByCommunityId(1);
    expect(repo.delete).toHaveBeenCalledWith({
      community: { communityId: 1 },
    });
  });
});
