import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';
import { MyLogger } from 'src/common/logger/logger.service';

export class MockCustomerRepository {
  readonly mockCustomer: Customer = {
    userId: 1,
    customerId: 1,
    customerNickname: '홍길동',
    customerCreatedAt: new Date(),
    customerUpdatedAt: new Date(),
    customerDeletedAt: null,
  };
}

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: CustomerRepository;
  let logger: MyLogger;

  const mockCustomer = new MockCustomerRepository().mockCustomer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: { createCustomer: jest.fn() },
        },
        {
          provide: MyLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<CustomerRepository>(CustomerRepository);
    logger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create a new customer with the provided data', async () => {
      const customerData = { userId: 1 };
      const newCustomer: Customer = {
        customerId: 1,
        ...customerData,
        customerNickname: null,
        customerCreatedAt: new Date(),
        customerUpdatedAt: new Date(),
        customerDeletedAt: null,
      };
      (repository.createCustomer as jest.Mock).mockResolvedValue(newCustomer);

      const result = await service.createCustomer(customerData.userId);

      expect(result).toEqual(newCustomer);
    });
  });
});
