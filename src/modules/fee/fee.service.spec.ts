import { Test, TestingModule } from '@nestjs/testing';
import { FeeService } from './fee.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { TransactionTypeEnum } from '@prisma/client';

describe('FeeService', () => {
  let service: FeeService;

  const mockPrismaService = {
    baseFee: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FeeService>(FeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllConfig', () => {
    it('should return 3 base fee DTOs with all fields filled', async () => {
      const baseFees = [
        {
          id: 1,
          code: 'PUR-QRIS-PDN',
          providerName: 'PDN',
          paymentMethodName: 'QRIS',
          transactionType: TransactionTypeEnum.PURCHASE,
          feeProviderFixed: new Decimal(100),
          feeProviderPercentage: new Decimal(1),
          isActive: true,
        },
        {
          id: 2,
          code: 'TOP-TRANSFER-INT',
          providerName: 'INTERNAL',
          paymentMethodName: 'TRANSFERBANK',
          transactionType: TransactionTypeEnum.TOPUP,
          feeProviderFixed: new Decimal(0),
          feeProviderPercentage: new Decimal(0),
          isActive: true,
        },
        {
          id: 3,
          code: 'WIT-TRANSFER-PDN',
          providerName: 'PDN',
          paymentMethodName: 'TRANSFERBANK',
          transactionType: TransactionTypeEnum.WITHDRAW,
          feeProviderFixed: new Decimal(500),
          feeProviderPercentage: new Decimal(0.5),
          isActive: false,
        },
      ];
      mockPrismaService.baseFee.findMany.mockResolvedValue(baseFees);

      const result = await service.findAllConfig();

      expect(result).toHaveLength(3);
      // Verify first DTO fields
      expect(result[0].id).toBe(1);
      expect(result[0].code).toBe('PUR-QRIS-PDN');
      expect(result[0].providerName).toBe('PDN');
      expect(result[0].paymentMethodName).toBe('QRIS');
      expect(result[0].transactionType).toBe(TransactionTypeEnum.PURCHASE);
      expect(result[0].feeProviderFixed).toEqual(new Decimal(100));
      expect(result[0].feeProviderPercentage).toEqual(new Decimal(1));
    });

    it('should return empty array when no base fees exist', async () => {
      mockPrismaService.baseFee.findMany.mockResolvedValue([]);

      const result = await service.findAllConfig();

      expect(result).toHaveLength(0);
    });
  });
});
