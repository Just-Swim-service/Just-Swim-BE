import { Module } from '@nestjs/common';
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
import { SecurityModule } from './common/security/security.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { NotificationModule } from './notification/notification.module';
import { CommunityModule } from './community/community.module';
import { SecurityGuard } from './common/guards/security.guard';
import * as Joi from 'joi';
import { envVariables } from './common/const/env.const';
import { AuthGuard } from './auth/guard/auth.guard';
import { CronModule } from './common/cron/cron.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    CronModule,
    LoggerModule,
    SecurityModule, // 보안 서비스 모듈 추가
    // Rate Limiting 설정
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1초
        limit: 10, // 1초당 10회 요청
      },
      {
        name: 'medium',
        ttl: 60000, // 1분
        limit: 100, // 1분당 100회 요청
      },
      {
        name: 'long',
        ttl: 900000, // 15분
        limit: 1000, // 15분당 1000회 요청
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
    // db 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isDevelopment =
          configService.get<string>('NODE_ENV') === 'development';
        return {
          type: 'mysql',
          host: configService.get<string>(envVariables.dbHost),
          port: configService.get<number>(envVariables.dbPort),
          username: configService.get<string>(envVariables.dbUsername),
          password: configService.get<string>(envVariables.dbPassword),
          database: configService.get<string>(envVariables.dbDatabase),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isDevelopment, // 보안 강화: 프로덕션에서는 synchronize 비활성화
          logging: !isDevelopment ? ['error', 'warn', 'migration'] : false, // 보안 강화: 프로덕션에서는 로깅 활성화
          extra: {
            connectionLimit: 20,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            ssl: !isDevelopment ? { rejectUnauthorized: false } : false, // 보안 강화: SSL 연결 강제 (프로덕션)
          },
          cache: {
            duration: 30000,
          },
          poolSize: 20,
          maxQueryExecutionTime: 10000, // 보안 강화: 쿼리 실행 시간 제한
        };
      },
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
    NotificationModule,
    CommunityModule,
    HealthModule,
    MetricsModule,
  ],
  providers: [
    JwtService,
    { provide: APP_GUARD, useClass: SecurityGuard }, // 보안 가드 (가장 먼저 실행)
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // Rate Limiting 가드
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
