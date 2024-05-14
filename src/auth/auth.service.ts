import { Injectable } from '@nestjs/common';
import { Users } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import { UsersDto } from 'src/users/dto/users.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /* 사용자 검증 */
  async validateUser(email: string, provider: string): Promise<Users | null> {
    try {
      const exUser = await this.usersService.findUserByEmail(email, provider);
      if (!exUser) {
        return null;
      }
      return exUser;
    } catch (error) {
      throw new Error('사용자 검증을 확인하는 중에 오류가 발생했습니다.');
    }
  }

  /* token */
  async getToken(userId: number): Promise<string> {
    try {
      const tokenExpiry: number = 3600;
      const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET);
      return accessToken;
    } catch (error) {
      throw new Error('토큰 생성 중에 오류가 발생했습니다.');
    }
  }

  /* user 생성 */
  async createUser(userData: UsersDto): Promise<Users> {
    try {
      return await this.usersService.createUser(userData);
    } catch (error) {
      throw new Error('사용자 생성 중에 오류가 발생했습니다.(auth)');
    }
  }
}
