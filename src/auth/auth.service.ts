import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';

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
      ) as {
        userId: number;
      };
      return payload;
    } catch (error) {
      throw new UnauthorizedException('refreshToken이 유효하지 않습니다.');
    }
  }
}
