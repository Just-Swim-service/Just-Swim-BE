import { Module, forwardRef } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { LectureRepository } from './lecture.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from './entity/lecture.entity';
import { MemberModule } from 'src/member/member.module';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lecture]), MemberModule, LoggerModule],
  controllers: [LectureController],
  providers: [LectureService, LectureRepository],
  exports: [LectureService, LectureRepository],
})
export class LectureModule {}
