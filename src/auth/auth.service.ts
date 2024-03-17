import { Injectable } from '@nestjs/common';
import { Users } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, provider: string): Promise<Users | null> {
    const exUser = await this.usersService.findUserByEmail(email, provider);
    if (!exUser) {
      return null;
    }
    return exUser;
  }

  async getToken(userId: number): Promise<string> {
    const tokenExpiry: number = 3600;
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiry,
    });
    return accessToken;
  }

  async createUser({
    email,
    profileImage,
    name,
    provider,
    userType,
  }): Promise<Users> {
    return await this.usersService.createUser({
      email,
      profileImage,
      name,
      provider,
      userType,
    });
  }
}
