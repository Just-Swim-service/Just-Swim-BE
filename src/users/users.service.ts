import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { UsersDto } from './dto/users.dto';
import { UpdateResult } from 'typeorm';
import { EditUserDto } from './dto/editUser.dto';

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

  async findUserByPk(userId: number): Promise<Users> {
    return await this.usersRepository.findUserByPk(userId);
  }

  async selectUserType(
    userId: number,
    userType: string,
  ): Promise<UpdateResult> {
    return await this.usersRepository.selectUserType(userId, userType);
  }

  async editUserProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<UpdateResult> {
    return await this.usersRepository.editUserProfile(userId, editUserDto);
  }
}
