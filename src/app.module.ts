import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { CustomerModule } from './customer/customer.module';
import { InstructorModule } from './instructor/instructor.module';
import { LectureModule } from './lecture/lecture.module';
import { MemberModule } from './member/member.module';
import { FeedbackModule } from './feedback/feedback.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/response/http-exception.filter';
import { LoggerModule } from './common/logger/logger.module';
import { ImageModule } from './image/image.module';
import { AwsModule } from './common/aws/aws.module';
import { ResponseModule } from './common/response/response.module';
import { WithdrawalReasonModule } from './withdrawal-reason/withdrawal-reason.module';

import * as Joi from 'joi';
import { envVariables } from './common/const/env.const';
import { AuthGuard } from './auth/guard/auth.guard';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
      }),
    }),
    // db 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>(envVariables.dbHost),
        port: configService.get<number>(envVariables.dbPort),
        username: configService.get<string>(envVariables.dbUsername),
        password: configService.get<string>(envVariables.dbPassword),
        database: configService.get<string>(envVariables.dbDatabase),
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
  providers: [
    JwtService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
