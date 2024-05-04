import { Injectable } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async createCustomer(userId: number): Promise<Customer> {
    try {
      return await this.customerRepository.createCustomer(userId);
    } catch (error) {
      throw new Error('수강생 프로필 생성 중에 오류가 발생했습니다.');
    }
  }

  async findCustomer(userId: number): Promise<Customer> {
    try {
      return await this.customerRepository.findCustomer(userId);
    } catch (error) {
      throw new Error('수강생 프로필 조회 중 오류가 발생했습니다.');
    }
  }
}
