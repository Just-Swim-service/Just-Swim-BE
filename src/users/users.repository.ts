import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UsersDto } from './dto/users.dto';

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

  async createUser(userData: UsersDto): Promise<Users> {
    const user = new Users();
    user.email = userData.email;
    user.name = userData.name;
    user.profileImage = userData.profileImage;
    user.provider = userData.provider;
    user.userType = userData.userType;
    await this.usersRepository.save(user);
    return user;
  }
}
