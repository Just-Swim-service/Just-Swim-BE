import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    return await this.usersRepository.findOne({ where: { email, provider } });
  }

  async createUser({
    email,
    profileImage,
    name,
    provider,
    userType,
  }): Promise<Users> {
    const user = new Users();
    user.email = email;
    user.name = name;
    user.profileImage = profileImage;
    user.provider = provider;
    user.userType = userType;
    await this.usersRepository.save(user);
    return user;
  }
}
