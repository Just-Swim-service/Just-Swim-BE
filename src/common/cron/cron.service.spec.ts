import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('CronService', () => {
  let service: CronService;
  let lectureRepository: Partial<Record<keyof Repository<Lecture>, jest.Mock>>;

  beforeEach(async () => {
    // query builder 체이닝용 mock 객체
    const mockQueryBuilder: any = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 3 }),
    };

    lectureRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: getRepositoryToken(Lecture),
          useValue: lectureRepository,
        },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should mark past lectures as deleted', async () => {
    await service.markPastLecturesAsDeleted();

    expect(lectureRepository.createQueryBuilder).toHaveBeenCalled();

    const qb = lectureRepository.createQueryBuilder();
    expect(qb.update).toHaveBeenCalled();
    expect(qb.set).toHaveBeenCalledWith({ lectureDeletedAt: expect.any(Date) });
    expect(qb.where).toHaveBeenCalledWith(
      'lectureEndDate < :today',
      expect.objectContaining({ today: expect.any(Date) }),
    );
    expect(qb.andWhere).toHaveBeenCalledWith('lectureDeletedAt IS NULL');
    expect(qb.execute).toHaveBeenCalled();
  });
});
