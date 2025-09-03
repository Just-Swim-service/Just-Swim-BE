import { Module, forwardRef } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { LectureRepository } from './lecture.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from './entity/lecture.entity';
import { MemberModule } from 'src/member/member.module';
import { AwsModule } from 'src/common/aws/aws.module';
import { UsersModule } from 'src/users/users.module';
import { LectureOwnershipGuard } from 'src/auth/guard/lecture-ownership.guard';
import { UserTypeGuard } from 'src/auth/guard/user-type.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecture]),
    forwardRef(() => MemberModule),
    forwardRef(() => AwsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [LectureController],
  providers: [
    LectureService,
    LectureRepository,
    LectureOwnershipGuard,
    UserTypeGuard,
  ],
  exports: [LectureService, LectureRepository],
})
export class LectureModule {}
