import { Module, forwardRef } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { LectureRepository } from './lecture.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from './entity/lecture.entity';
import { LectureQrToken } from './entity/lecture-qr-token.entity';
import { LectureQrTokenService } from './lecture-qr-token.service';
import { MemberModule } from 'src/member/member.module';
import { AwsModule } from 'src/common/aws/aws.module';
import { UsersModule } from 'src/users/users.module';
import { LectureOwnershipGuard } from 'src/auth/guard/lecture-ownership.guard';
import { UserTypeGuard } from 'src/auth/guard/user-type.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecture, LectureQrToken]),
    JwtModule.register({}),
    forwardRef(() => MemberModule),
    forwardRef(() => AwsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [LectureController],
  providers: [
    LectureService,
    LectureRepository,
    LectureQrTokenService,
    LectureOwnershipGuard,
    UserTypeGuard,
  ],
  exports: [LectureService, LectureRepository, LectureQrTokenService],
})
export class LectureModule {}
