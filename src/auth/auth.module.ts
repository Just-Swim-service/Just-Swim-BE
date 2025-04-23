import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from 'src/common/logger/logger.module';
import { MyLogger } from 'src/common/logger/logger.service';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
  ],
  providers: [
    AuthService,
    KakaoStrategy,
    NaverStrategy,
    GoogleStrategy,
    JwtService,
    MyLogger,
    AuthGuard,
  ],
  exports: [AuthService, PassportModule, JwtService],
})
export class AuthModule {}
