import { Injectable } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async createCustomer(userId: number): Promise<Customer> {
    return await this.customerRepository.createCustomer(userId);
  }
}
