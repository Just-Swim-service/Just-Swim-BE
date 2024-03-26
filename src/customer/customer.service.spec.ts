import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entity/customer.entity';

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: CustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: { createCustomer: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<CustomerRepository>(CustomerRepository);
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
        nickName: null,
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
