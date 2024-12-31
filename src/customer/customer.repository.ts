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

  /* userType을 customer로 지정할 경우 customer 정보 생성 */
  async createCustomer(userId: number): Promise<Customer> {
    const newCustomer = this.customerRepository.create({ user: { userId } });

    return await this.customerRepository.save(newCustomer);
  }

  /* customer의 정보 조회 */
  async findCustomerByUserId(userId: number): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { user: { userId } },
    });
  }
}
