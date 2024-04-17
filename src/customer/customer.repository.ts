import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(userId: number): Promise<Customer> {
    const customer = new Customer();
    customer.userId = userId;
    await this.customerRepository.save(customer);
    return customer;
  }

  async findCustomer(userId: number): Promise<Customer> {
    return await this.customerRepository
      .createQueryBuilder('customer')
      .select(['customerId', 'userId', 'customerNickname'])
      .where('customer.userId = :userId', { userId })
      .getRawOne();
  }
}
