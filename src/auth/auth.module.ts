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
import { RedirectAuthGuard } from './guard/redirect-auth.guard';
import { UserTypeGuard } from './guard/user-type.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KakaoStrategy,
    NaverStrategy,
    GoogleStrategy,
    JwtService,
    MyLogger,
    AuthGuard,
    RedirectAuthGuard,
    UserTypeGuard,
  ],
  exports: [AuthService, PassportModule, JwtService, UserTypeGuard],
})
export class AuthModule {}
