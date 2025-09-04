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
    .setTitle('Just-Swim API Document')
    .setDescription('Just-Swim API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'authorization',
        description: 'Enter JWT Token',
        in: 'header',
      },
      'accessToken',
    )
    .addServer('https://api.just-swim.kr', '서버 주소')
    .addServer('http://localhost:3001', '로컬 주소')
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
