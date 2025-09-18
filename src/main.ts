import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { MyLogger } from './common/logger/logger.service';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new MyLogger(),
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  expressApp.set('etag', false);
  expressApp.set('x-powered-by', false);
  expressApp.set('view cache', true);

  // UTF-8 인코딩 설정
  expressApp.set('json spaces', 2);
  expressApp.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // JSON 파싱 설정 (UTF-8 보장)
  expressApp.use(
    expressApp.json({
      limit: '10mb',
      type: 'application/json',
    }),
  );
  expressApp.use(
    expressApp.urlencoded({
      extended: true,
      limit: '10mb',
      type: 'application/x-www-form-urlencoded',
    }),
  );

  // 보안 헤더 설정
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          scriptSrc: ["'self'", 'https://apis.google.com'],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'https://just-swim.kr',
            'https://api.just-swim.kr',
          ],
          connectSrc: [
            "'self'",
            'https://api.just-swim.kr',
            'https://just-swim.kr',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          formAction: ["'self'", 'https://just-swim.kr'],
        },
      },
      crossOriginEmbedderPolicy: false, // CORS와 호환성을 위해 비활성화
      hsts: {
        maxAge: 31536000, // 1년
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: { action: 'deny' },
    }),
  );

  app.use(compression());

  const allowedOrigins = [
    'https://just-swim.kr',
    'https://www.just-swim.kr',
    'https://api.just-swim.kr',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api'); // 글로벌 프리픽스 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // 자동 변환 활성화
      transformOptions: {
        enableImplicitConversion: true, // 암시적 변환 활성화
      },
    }),
  ); // 유효성 검사 파이프라인

  // swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Just-Swim API Documentation')
    .setDescription(
      `
      ## Just-Swim 수영 강습 관리 시스템 API

      ### 주요 기능
      - **사용자 관리**: 강사/수강생 회원가입, 로그인, 프로필 관리
      - **강의 관리**: 강의 생성, 수정, 삭제, 일정 관리
      - **피드백 시스템**: 강의 피드백 작성, 조회, 관리
      - **이미지 관리**: 프로필 이미지, 피드백 이미지 업로드
      - **QR 코드**: 수강생 등록을 위한 QR 코드 생성

      ### 인증 방식
      - JWT 토큰 기반 인증
      - OAuth 2.0 (Google, Kakao, Naver) 지원

      ### API 버전
      - 현재 버전: v1.0
      - 기본 경로: /api

      ### 에러 코드
      - 200: 성공
      - 400: 잘못된 요청
      - 401: 인증 실패
      - 403: 권한 없음
      - 404: 리소스 없음
      - 409: 충돌 (중복)
      - 500: 서버 오류
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Just-Swim Team',
      'https://just-swim.kr',
      'contact@just-swim.kr',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT 토큰을 입력하세요. Bearer 접두사는 생략 가능합니다.',
        in: 'header',
      },
      'accessToken',
    )
    .addTag('Health', '서비스 상태 확인')
    .addTag('Auth', '인증 및 인가')
    .addTag('Users', '사용자 관리')
    .addTag('Customer', '수강생 관리')
    .addTag('Instructor', '강사 관리')
    .addTag('Lecture', '강의 관리')
    .addTag('Member', '수강생 등록 관리')
    .addTag('Feedback', '피드백 관리')
    .addTag('Image', '이미지 관리')
    .addTag('Withdrawal', '회원 탈퇴 관리')
    .addServer('https://api.just-swim.kr', 'Production Server')
    .addServer('http://localhost:3001', 'Development Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // 서버 포트
  await app.listen(3001);
}
bootstrap();

process.on('uncaughtException', (err) => {
  console.error('[🔥 Uncaught Exception]', err);
  // 프로덕션 환경에서는 process.exit(1) 고려
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[💥 Unhandled Rejection]', reason);
  // 프로덕션 환경에서는 process.exit(1) 고려
});
