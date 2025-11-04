import * as dotenv from 'dotenv';
import { join } from 'path';

// 테스트 환경변수 로드
dotenv.config({ path: join(__dirname, '..', '.env.test') });

// 환경변수가 없는 경우 기본값 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'justswim_test';

// JWT (최소 32자)
process.env.ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  'test_access_token_secret_for_testing_minimum_32_chars';
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  'test_refresh_token_secret_for_testing_minimum_32_chars';

// OAuth
process.env.KAKAO_ID = process.env.KAKAO_ID || 'test_kakao_id';
process.env.NAVER_ID = process.env.NAVER_ID || 'test_naver_id';
process.env.NAVER_SECRET = process.env.NAVER_SECRET || 'test_naver_secret';
process.env.GOOGLE_ID = process.env.GOOGLE_ID || 'test_google_id';
process.env.GOOGLE_SECRET = process.env.GOOGLE_SECRET || 'test_google_secret';

// QR & Redirect URIs
process.env.SERVER_QR_CHECK_URI =
  process.env.SERVER_QR_CHECK_URI || 'http://localhost:3001/api/qr/check';
process.env.SELECT_USERTYPE_REDIRECT_URI =
  process.env.SELECT_USERTYPE_REDIRECT_URI ||
  'http://localhost:3000/select-user-type';
process.env.SELECT_USERTYPE_PROD_REDIRECT_URI =
  process.env.SELECT_USERTYPE_PROD_REDIRECT_URI ||
  'http://localhost:3000/select-user-type';
process.env.HOME_REDIRECT_URI =
  process.env.HOME_REDIRECT_URI || 'http://localhost:3000';

// AWS
process.env.AWS_REGION = process.env.AWS_REGION || 'ap-northeast-2';
process.env.AWS_S3_ACCESS_KEY =
  process.env.AWS_S3_ACCESS_KEY || 'test_access_key';
process.env.AWS_S3_SECRET_ACCESS_KEY =
  process.env.AWS_S3_SECRET_ACCESS_KEY || 'test_secret_key';
process.env.AWS_S3_BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || 'test-bucket';

// CloudWatch (Optional)
process.env.CLOUDWATCH_LOG_GROUP =
  process.env.CLOUDWATCH_LOG_GROUP || 'test-logs';
process.env.CLOUDWATCH_LOG_STREAM =
  process.env.CLOUDWATCH_LOG_STREAM || 'test-stream';

