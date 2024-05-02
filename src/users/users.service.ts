import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Users } from './entity/users.entity';
import { UsersDto } from './dto/users.dto';
import { EditUserDto } from './dto/editUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUserByEmail(
    email: string,
    provider: string,
  ): Promise<Users | undefined> {
    try {
      return await this.usersRepository.findUserByEmail(email, provider);
    } catch (error) {
      throw new Error('사용자를 찾는 중에 오류가 발생했습니다.');
    }
  }

  async createUser(userData: UsersDto): Promise<Users> {
    try {
      return await this.usersRepository.createUser(userData);
    } catch (error) {
      throw new Error('사용자 생성 중에 오류가 발생했습니다.');
    }
  }

  async findUserByPk(userId: number): Promise<Users> {
    try {
      return await this.usersRepository.findUserByPk(userId);
    } catch (error) {
      throw new Error('사용자를 찾는 중에 오류가 발생했습니다.');
    }
  }

  async selectUserType(userId: number, userType: string): Promise<void> {
    try {
      await this.usersRepository.selectUserType(userId, userType);
    } catch (error) {
      throw new Error('사용자 타입을 선택하는 중에 오류가 발생했습니다.');
    }
  }

  async editUserProfile(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<void> {
    try {
      await this.usersRepository.editUserProfile(userId, editUserDto);
    } catch (error) {
      throw new Error('사용자 프로필을 수정하는 중에 오류가 발생했습니다.');
    }
  }
}
