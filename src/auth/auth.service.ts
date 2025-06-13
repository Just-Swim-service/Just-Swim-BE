import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '14d',
      },
    );
    await this.usersService.updateRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
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
