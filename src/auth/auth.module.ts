import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [AuthService, KakaoStrategy, NaverStrategy, GoogleStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
