import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecture } from 'src/lecture/entity/lecture.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class CronService {
  //   private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markPastLecturesAsDeleted() {
    const today = dayjs().startOf('day').toDate();

    const result = await this.lectureRepository
      .createQueryBuilder()
      .update()
      .set({ lectureDeletedAt: new Date() })
      .where('lectureEndDate < :today', { today })
      .andWhere('lectureDeletedAt IS NULL')
      .execute();

    // this.logger.log(`${result.affected} lectures marked as deleted`);
  }
}
