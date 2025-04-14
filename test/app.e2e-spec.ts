import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as cookieParser from 'cookie-parser';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/login (POST)', () => {
    it('로그인 성공 시 200 반환과 cookie에 토큰을 심음', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          email: 'test1@daum.net',
          provider: 'kakao',
        })
        .expect(200);

      expect(res.body.message).toBe('로그인 성공');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('로그인 실패 시 400 에러 반환', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'test@example.com', provider: 'kakao' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  describe('/api/lecture/schedule (GET)', () => {
    let cookie: string;

    beforeAll(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'test1@daum.net', provider: 'kakao' })
        .expect(200);

      cookie = loginRes.headers['set-cookie'];
    });

    it('로그인된 유저가 강의 스케줄 조회 성공 시 200 반환', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/lecture/schedule')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.message).toBe('스케줄에 해당하는 강의 조회 성공');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
