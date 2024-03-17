import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    return await this.usersRepository.findUserByEmail(email, provider);
  }

  async createUser({
    email,
    profileImage,
    name,
    provider,
    userType,
  }): Promise<Users> {
    return await this.usersRepository.createUser({
      email,
      profileImage,
      name,
      provider,
      userType,
    });
  }
}
