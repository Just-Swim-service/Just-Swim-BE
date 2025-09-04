import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import * as bcrypt from 'bcrypt';
import { SessionManagerService } from 'src/common/security/session-manager.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionManager: SessionManagerService,
  ) {}

  /* 사용자 검증 */
  async validateUser(email: string, provider: string): Promise<Users | null> {
    const exUser = await this.usersService.findUserByEmail(email, provider);
    if (!exUser) {
      return null;
    }
    return exUser;
  }

  /* token */
  async getToken(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId?: string;
  }> {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const now = Math.floor(Date.now() / 1000);
    const jti = `${userId}_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const accessTokenPayload = {
      userId,
      userType: user.userType,
      email: user.email,
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      jti,
      iat: now,
    };

    const refreshTokenPayload = {
      userId,
      jti,
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      iat: now,
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '14d',
      },
    );

    await this.usersService.updateRefreshToken(userId, refreshToken);

    // 세션 생성 (IP와 User-Agent가 제공된 경우)
    let sessionId: string | undefined;
    if (ipAddress && userAgent) {
      sessionId = this.sessionManager.createSession(
        userId,
        user.userType,
        ipAddress,
        userAgent,
      );
    }

    return { accessToken, refreshToken, sessionId };
  }

  /* generateAccessToken */
  async generateAccessToken(userId: number): Promise<{ accessToken: string }> {
    const user = await this.usersService.findUserByPk(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const now = Math.floor(Date.now() / 1000);
    const jti = `${userId}_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const accessTokenPayload = {
      userId,
      userType: user.userType,
      email: user.email,
      iss: 'https://api.just-swim.kr',
      aud: 'https://just-swim.kr',
      jti,
      iat: now,
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '15m',
      },
    );

    return { accessToken };
  }

  /* user 생성 */
  async createUser(userData: CreateUsersDto): Promise<Users> {
    return await this.usersService.createUser(userData);
  }

  async verifyRefreshToken(refreshToken: string): Promise<{ userId: number }> {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      ) as { userId: number };

      const user = await this.usersService.findUserByPk(payload.userId);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('refreshToken이 유효하지 않습니다.');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error('⏰ refreshToken 만료됨:', error);
        throw new UnauthorizedException('refreshToken이 만료되었습니다.');
      }

      console.error('Refresh token 검증 실패:', error);
      throw new UnauthorizedException('refreshToken이 유효하지 않습니다.');
    }
  }
}
