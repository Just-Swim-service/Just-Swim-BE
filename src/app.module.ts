import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { CustomerModule } from './customer/customer.module';
import { InstructorModule } from './instructor/instructor.module';
import { LectureModule } from './lecture/lecture.module';
import { AuthMiddleWare } from './auth/middleware/auth.middleware';
import { MemberModule } from './member/member.module';
import { FeedbackModule } from './feedback/feedback.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/response/http-exception.filter';
import { LoggerModule } from './common/logger/logger.module';
import { ImageModule } from './image/image.module';
import { AwsModule } from './common/aws/aws.module';
import { ResponseModule } from './common/response/response.module';
import { WithdrawalReasonModule } from './withdrawal-reason/withdrawal-reason.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // db 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CustomerModule,
    InstructorModule,
    LectureModule,
    MemberModule,
    FeedbackModule,
    ImageModule,
    AwsModule,
    ResponseModule,
    WithdrawalReasonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleWare).forRoutes(
      // Users
      { path: 'user/:userType', method: RequestMethod.POST },
      { path: 'user/edit', method: RequestMethod.PATCH },
      { path: 'user/myProfile', method: RequestMethod.GET },
      { path: 'user/logout', method: RequestMethod.POST },
      { path: 'user/withdraw', method: RequestMethod.DELETE },
      { path: 'user/profileImage/presignedUrl', method: RequestMethod.POST },
      // Lecture
      { path: 'lecture', method: RequestMethod.POST },
      { path: 'lecture/schedule', method: RequestMethod.GET },
      { path: 'lecture/myLectures', method: RequestMethod.GET },
      { path: 'lecture/:lectureId', method: RequestMethod.GET },
      { path: 'lecture/:lectureId', method: RequestMethod.PATCH },
      { path: 'lecture/:lectureId', method: RequestMethod.DELETE },
      { path: 'lecture/:lectureId/qr-code', method: RequestMethod.POST },
      { path: 'lecture/memberList/:lectureId', method: RequestMethod.GET },
      // Member
      { path: 'member/qr-code', method: RequestMethod.GET },
      { path: 'member', method: RequestMethod.GET },
      // feedback
      { path: 'feedback', method: RequestMethod.GET },
      { path: 'feedback/:feedbackId', method: RequestMethod.GET },
      { path: 'feedback', method: RequestMethod.POST },
      {
        path: 'feedback/feedbackImage/presignedUrl',
        method: RequestMethod.POST,
      },
      { path: 'feedback/:feedbackId', method: RequestMethod.PATCH },
      { path: 'feedback/:feedbackId', method: RequestMethod.DELETE },
    );
  }
}
