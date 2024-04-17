import { Module, forwardRef } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { LectureRepository } from './lecture.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from './entity/lecture.entity';
import { InstructorModule } from 'src/instructor/instructor.module';
import { CustomerModule } from 'src/customer/customer.module';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecture]),
    forwardRef(() => InstructorModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => MemberModule),
  ],
  controllers: [LectureController],
  providers: [LectureService, LectureRepository],
  exports: [LectureService, LectureRepository],
})
export class LectureModule {}
