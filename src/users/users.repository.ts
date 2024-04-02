import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UsersDto } from './dto/users.dto';
import { UserTypeDto } from './dto/userType.dto';

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
    user.phoneNumber = userData.phoneNumber;
    user.birth = userData.birth;
    await this.usersRepository.save(user);
    return user;
  }

  async findUserByPk(userId: number): Promise<Users> {
    return await this.usersRepository.findOne({ where: { userId } });
  }

  async selectUserType(
    userId: number,
    userTypeDto: UserTypeDto,
  ): Promise<UpdateResult> {
    const userType = userTypeDto.userType;
    return await this.usersRepository.update(userId, { userType });
  }
}
