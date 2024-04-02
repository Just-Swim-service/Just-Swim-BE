import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './entity/customer.entity';
import { CustomerRepository } from './customer.repository';

export class MockCustomerRepository {
  private readonly customer: Customer[] = [
    {
      customerId: 1,
      userId: 2,
      customerNickname: null,
      customerCreatedAt: new Date(),
      customerUpdatedAt: new Date(),
      customerDeletedAt: null,
    },
  ];
}

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        CustomerService,
        { provide: CustomerRepository, useClass: MockCustomerRepository },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
