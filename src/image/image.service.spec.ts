import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { ImageRepository } from './image.repository';

export class MockImageRepository {}

describe('ImageService', () => {
  let service: ImageService;
  let repository: ImageRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        { provide: ImageRepository, useClass: MockImageRepository },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    repository = module.get<ImageRepository>(ImageRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
