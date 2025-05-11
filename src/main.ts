import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.enableCors({
    origin: [
      'https://just-swim.kr',
      'https://www.just-swim.kr',
      'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 204,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api'); // 글로벌 프리픽스 설정
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
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
