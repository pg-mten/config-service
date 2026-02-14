import { Test, TestingModule } from '@nestjs/testing';
import { UserProviderService } from './user-provider.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionUserRole } from 'src/shared/constant/transaction.constant';
import { TransactionTypeEnum } from '@prisma/client';

describe('UserProviderService', () => {
  let service: UserProviderService;

  const mockPrisma = {
    agent: { findUniqueOrThrow: jest.fn() },
    merchantFee: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProviderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserProviderService>(UserProviderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProfileProvider', () => {
    it('should return admin provider with all DTO fields verified', async () => {
      const dto = {
        userId: 1,
        userRole: TransactionUserRole.ADMIN,
        transactionType: 'PURCHASE',
      };

      const result = await service.findProfileProvider(dto as any);

      expect(result.userId).toBe(1);
      expect(result.userRole).toBe(TransactionUserRole.ADMIN);
      expect(result.providerName).toBe('aaa');
      expect(result.paymentMethodName).toBe('TRANSFERBANK');
    });

    it('should return agent provider with all fields filled', async () => {
      const mockAgent = {
        id: 5,
        providerName: 'PDN',
        paymentMethodName: 'QRIS',
      };
      mockPrisma.agent.findUniqueOrThrow.mockResolvedValue(mockAgent);

      const dto = {
        userId: 5,
        userRole: TransactionUserRole.AGENT,
        transactionType: 'PURCHASE',
      };

      const result = await service.findProfileProvider(dto as any);

      expect(result.userId).toBe(5);
      expect(result.userRole).toBe(TransactionUserRole.AGENT);
      expect(result.providerName).toBe('PDN');
      expect(result.paymentMethodName).toBe('QRIS');
      expect(mockPrisma.agent.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it('should return agent provider with defaults when nullable fields are null', async () => {
      const mockAgent = {
        id: 8,
        providerName: null,
        paymentMethodName: null,
      };
      mockPrisma.agent.findUniqueOrThrow.mockResolvedValue(mockAgent);

      const dto = {
        userId: 8,
        userRole: TransactionUserRole.AGENT,
        transactionType: 'PURCHASE',
      };

      const result = await service.findProfileProvider(dto as any);

      expect(result.userId).toBe(8);
      expect(result.userRole).toBe(TransactionUserRole.AGENT);
      // Falls back to defaults when null
      expect(result.providerName).toBe('aaa');
      expect(result.paymentMethodName).toBe('TRANSFERBANK');
    });

    it('should throw when agent not found', async () => {
      mockPrisma.agent.findUniqueOrThrow.mockRejectedValue(
        new Error('No Agent found'),
      );

      const dto = {
        userId: 999,
        userRole: TransactionUserRole.AGENT,
        transactionType: 'PURCHASE',
      };

      await expect(service.findProfileProvider(dto as any)).rejects.toThrow(
        'No Agent found',
      );
    });

    it('should return merchant provider when matching transactionType found among 3 merchantFees', async () => {
      const mockMerchantFees = [
        {
          id: 1,
          merchantId: 10,
          baseFeeId: 1,
          baseFee: {
            transactionType: TransactionTypeEnum.PURCHASE,
            providerName: 'PDN',
            paymentMethodName: 'QRIS',
          },
        },
        {
          id: 2,
          merchantId: 10,
          baseFeeId: 2,
          baseFee: {
            transactionType: TransactionTypeEnum.TOPUP,
            providerName: 'INTERNAL',
            paymentMethodName: 'TRANSFERBANK',
          },
        },
        {
          id: 3,
          merchantId: 10,
          baseFeeId: 3,
          baseFee: {
            transactionType: TransactionTypeEnum.WITHDRAW,
            providerName: 'PDN',
            paymentMethodName: 'TRANSFERBANK',
          },
        },
      ];
      mockPrisma.merchantFee.findMany.mockResolvedValue(mockMerchantFees);

      const dto = {
        userId: 10,
        userRole: TransactionUserRole.MERCHANT,
        transactionType: TransactionTypeEnum.PURCHASE,
      };

      const result = await service.findProfileProvider(dto as any);

      expect(result.userId).toBe(10);
      expect(result.userRole).toBe(TransactionUserRole.MERCHANT);
      expect(result.providerName).toBe('PDN');
      expect(result.paymentMethodName).toBe('QRIS');
      expect(mockPrisma.merchantFee.findMany).toHaveBeenCalledWith({
        where: { merchantId: 10 },
        include: { baseFee: true },
      });
    });

    it('should return fallback defaults when no matching transactionType found', async () => {
      const mockMerchantFees = [
        {
          id: 1,
          merchantId: 10,
          baseFeeId: 1,
          baseFee: {
            transactionType: TransactionTypeEnum.PURCHASE,
            providerName: 'PDN',
            paymentMethodName: 'QRIS',
          },
        },
        {
          id: 2,
          merchantId: 10,
          baseFeeId: 2,
          baseFee: {
            transactionType: TransactionTypeEnum.TOPUP,
            providerName: 'INTERNAL',
            paymentMethodName: 'TRANSFERBANK',
          },
        },
        {
          id: 3,
          merchantId: 10,
          baseFeeId: 3,
          baseFee: {
            transactionType: TransactionTypeEnum.WITHDRAW,
            providerName: 'PDN',
            paymentMethodName: 'TRANSFERBANK',
          },
        },
      ];
      mockPrisma.merchantFee.findMany.mockResolvedValue(mockMerchantFees);

      const dto = {
        userId: 10,
        userRole: TransactionUserRole.MERCHANT,
        transactionType: TransactionTypeEnum.DISBURSEMENT, // No match
      };

      const result = await service.findProfileProvider(dto as any);

      expect(result.providerName).toBe('Not registered yet');
      expect(result.paymentMethodName).toBe('Not Registered yet');
    });

    it('should return fallback defaults when merchantFee list is empty', async () => {
      mockPrisma.merchantFee.findMany.mockResolvedValue([]);

      const dto = {
        userId: 20,
        userRole: TransactionUserRole.MERCHANT,
        transactionType: TransactionTypeEnum.PURCHASE,
      };

      const result = await service.findProfileProvider(dto as any);

      expect(result.userId).toBe(20);
      expect(result.providerName).toBe('Not registered yet');
      expect(result.paymentMethodName).toBe('Not Registered yet');
    });
  });
});
