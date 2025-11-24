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
import { AllExceptionsFilter } from './common/response/all-exceptions.filter';
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
import { SearchModule } from './common/search/search.module';
import { SecurityGuard } from './common/guards/security.guard';
import { StatisticsModule } from './statistics/statistics.module';
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
        // Node Environment
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        
        // Database Configuration
        DB_HOST: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        
        // JWT Secrets (보안상 최소 16자 권장, 32자 이상 강력 권장)
        ACCESS_TOKEN_SECRET: Joi.string().required().min(16),
        REFRESH_TOKEN_SECRET: Joi.string().required().min(16),
        QR_TOKEN_SECRET: Joi.string().required().min(16),
        
        // OAuth - Kakao
        KAKAO_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().optional(),
        
        // OAuth - Naver
        NAVER_ID: Joi.string().required(),
        NAVER_SECRET: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().optional(),
        
        // OAuth - Google
        GOOGLE_ID: Joi.string().required(),
        GOOGLE_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().optional(),
        
        // QR Code
        SERVER_QR_CHECK_URI: Joi.string().uri().required(),
        
        // Redirect URIs
        SELECT_USERTYPE_REDIRECT_URI: Joi.string().uri().required(),
        SELECT_USERTYPE_PROD_REDIRECT_URI: Joi.string().uri().required(),
        HOME_REDIRECT_URI: Joi.string().uri().required(),
        SINGIN_REDIRECT_URI: Joi.string().uri().optional(),
        
        // AWS Configuration
        AWS_REGION: Joi.string().required(),
        AWS_S3_ACCESS_KEY: Joi.string().required(),
        AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        
        // CloudWatch (Optional)
        CLOUDWATCH_LOG_GROUP: Joi.string().optional(),
        CLOUDWATCH_LOG_STREAM: Joi.string().optional(),
        
        // Test DB (Optional)
        TEST_DB_HOST: Joi.string().optional(),
        TEST_DB_DATABASE: Joi.string().optional(),
        TEST_DB_PORT: Joi.number().optional(),
        TEST_DB_USERNAME: Joi.string().optional(),
        TEST_DB_PASSWORD: Joi.string().optional(),
        
        // Additional URLs
        NEXT_PUBLIC_API_URL: Joi.string().optional(),
      }),
      validationOptions: {
        abortEarly: false, // 모든 검증 오류를 한 번에 표시
        allowUnknown: true, // 스키마에 없는 환경변수 허용
      },
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
    SearchModule,
    HealthModule,
    MetricsModule,
    StatisticsModule,
  ],
  providers: [
    JwtService,
    { provide: APP_GUARD, useClass: SecurityGuard }, // 보안 가드 (가장 먼저 실행)
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // Rate Limiting 가드
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter }, // 모든 예외 처리 (HttpException 포함)
  ],
})
export class AppModule {}
