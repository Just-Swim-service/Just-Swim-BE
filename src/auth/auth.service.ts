import { Injectable } from '@nestjs/common';
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
  async getToken(userId: number): Promise<string> {
    const tokenExpiry: number = 3600;
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET);
    return accessToken;
  }

  /* user 생성 */
  async createUser(userData: CreateUsersDto): Promise<Users> {
    return await this.usersService.createUser(userData);
  }
}
