import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { CustomerModule } from './customer/customer.module';
import { InstructorModule } from './instructor/instructor.module';
import { LectureModule } from './lecture/lecture.module';
import { AuthMiddleWare } from './auth/middleware/auth.middleware';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // db 설정
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: true,
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    CustomerModule,
    InstructorModule,
    LectureModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleWare).forRoutes(
      // Users
      { path: 'user/:userType', method: RequestMethod.POST },
      { path: 'user/edit', method: RequestMethod.PATCH },
      { path: 'user/myProfile', method: RequestMethod.GET },
      // Lecture
      { path: 'lecture', method: RequestMethod.POST },
      { path: 'lecture/schedule', method: RequestMethod.GET },
      { path: 'lecture/myLectures', method: RequestMethod.GET },
      { path: 'lecture/memberList/:lectureId', method: RequestMethod.GET },
      { path: 'lecture/:lectureId', method: RequestMethod.GET },
      { path: 'lecture/:lectureId', method: RequestMethod.PATCH },
      { path: 'lecture/:lectureId', method: RequestMethod.DELETE },
      // Member
      { path: 'member/*', method: RequestMethod.ALL },
    );
  }
}
