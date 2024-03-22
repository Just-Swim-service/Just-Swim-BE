import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { UsersDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    return await this.usersRepository.findUserByEmail(email, provider);
  }

  async createUser(userData: UsersDto): Promise<Users> {
    return await this.usersRepository.createUser(userData);
  }
}
