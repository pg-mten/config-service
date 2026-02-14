import { Test, TestingModule } from '@nestjs/testing';
import { MerchantService } from './merchant.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserAuthClient } from 'src/microservice/auth/user.auth.client';
import { Decimal } from 'decimal.js';
import { ActionEnum } from 'src/shared/constant/merchant-fee.constant';
import { ResponseException } from 'src/shared/exception/response.exception';
import { TransactionTypeEnum } from '@prisma/client';

describe('MerchantService', () => {
  let service: MerchantService;

  const mockPrisma: any = {
    merchant: {
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
    },
    agentShareholder: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    baseFee: {
      findMany: jest.fn(),
    },
    merchantFee: {
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  };
  mockPrisma.$transaction = jest.fn((cb) => cb(mockPrisma) as unknown);

  const mockUserAuthClient = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UserAuthClient, useValue: mockUserAuthClient },
      ],
    }).compile();

    service = module.get<MerchantService>(MerchantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByIdThrow', () => {
    it('should return merchant if found', async () => {
      const mockMerchant = {
        id: 1,
        settlementInterval: 120,
        lastSettlementAt: new Date('2026-01-01T00:00:00Z'),
      };
      mockPrisma.merchant.findUniqueOrThrow.mockResolvedValue(mockMerchant);

      const result = await service.findByIdThrow(1);

      expect(result).toEqual(mockMerchant);
      expect(result.id).toBe(1);
      expect(result.settlementInterval).toBe(120);
      expect(mockPrisma.merchant.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw when merchant not found', async () => {
      mockPrisma.merchant.findUniqueOrThrow.mockRejectedValue(
        new Error('No Merchant found'),
      );

      await expect(service.findByIdThrow(999)).rejects.toThrow(
        'No Merchant found',
      );
    });
  });

  describe('findAllConfigByMerchantId', () => {
    it('should return complete config with 3 agentShareholders and 3 baseFees (all fields filled)', async () => {
      const lastSettlementDate = new Date('2026-01-15T10:00:00Z');
      mockPrisma.merchant.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        settlementInterval: 120,
        lastSettlementAt: lastSettlementDate,
      });
      mockPrisma.agentShareholder.findMany.mockResolvedValue([
        { agentId: 10, merchantId: 1, percentagePerAgent: new Decimal(40) },
        { agentId: 11, merchantId: 1, percentagePerAgent: new Decimal(35) },
        { agentId: 12, merchantId: 1, percentagePerAgent: new Decimal(25) },
      ]);
      mockPrisma.baseFee.findMany.mockResolvedValue([
        {
          id: 1,
          code: 'A-PUR',
          providerName: 'PDN',
          paymentMethodName: 'QRIS',
          transactionType: TransactionTypeEnum.PURCHASE,
          feeProviderFixed: new Decimal(100),
          feeProviderPercentage: new Decimal(1),
          isActive: true,
          merchantFees: [
            {
              id: 1,
              baseFeeId: 1,
              merchantId: 1,
              feeInternalFixed: new Decimal(200),
              feeInternalPercentage: new Decimal(2),
              feeAgentFixed: new Decimal(50),
              feeAgentPercentage: new Decimal(0.5),
            },
          ],
        },
        {
          id: 2,
          code: 'B-TOP',
          providerName: 'INTERNAL',
          paymentMethodName: 'TRANSFERBANK',
          transactionType: TransactionTypeEnum.TOPUP,
          feeProviderFixed: new Decimal(0),
          feeProviderPercentage: new Decimal(0),
          isActive: true,
          merchantFees: [], // No merchant fee config
        },
        {
          id: 3,
          code: 'C-WIT',
          providerName: 'PDN',
          paymentMethodName: 'TRANSFERBANK',
          transactionType: TransactionTypeEnum.WITHDRAW,
          feeProviderFixed: new Decimal(500),
          feeProviderPercentage: new Decimal(0.5),
          isActive: true,
          merchantFees: [
            {
              id: 2,
              baseFeeId: 3,
              merchantId: 1,
              feeInternalFixed: new Decimal(100),
              feeInternalPercentage: new Decimal(1),
              feeAgentFixed: new Decimal(0),
              feeAgentPercentage: new Decimal(0),
            },
          ],
        },
      ]);

      const result = await service.findAllConfigByMerchantId(1);

      expect(result).toBeDefined();
      expect(result.settlementInterval).toBe(120);
      expect(result.lastSettlementAt).not.toBeNull();
      expect(result.agentShareholders).toHaveLength(3);
      expect(result.agentShareholders![0].agentId).toBe(10);
      expect(result.agentShareholders![0].percentagePerAgent).toEqual(
        new Decimal(40),
      );
      expect(result.agentShareholders![1].agentId).toBe(11);
      expect(result.agentShareholders![2].agentId).toBe(12);
      expect(result.fees).toHaveLength(3);
      // First baseFee has merchantFee → sorted first
      expect(result.fees[0].baseFeeConfig.code).toBe('A-PUR');
      expect(result.fees[0].merchantFeeConfig).not.toBeNull();
      expect(result.fees[0].merchantFeeConfig!.feeInternalFixed).toEqual(
        new Decimal(200),
      );
    });

    it('should return null agentShareholders when merchant has none', async () => {
      mockPrisma.merchant.findUniqueOrThrow.mockResolvedValue({
        id: 2,
        settlementInterval: 60,
        lastSettlementAt: new Date(),
      });
      mockPrisma.agentShareholder.findMany.mockResolvedValue([]);
      mockPrisma.baseFee.findMany.mockResolvedValue([
        {
          id: 1,
          code: 'A',
          merchantFees: [],
          providerName: 'PDN',
          paymentMethodName: 'QRIS',
          transactionType: TransactionTypeEnum.PURCHASE,
          feeProviderFixed: new Decimal(0),
          feeProviderPercentage: new Decimal(0),
          isActive: true,
        },
      ]);

      const result = await service.findAllConfigByMerchantId(2);

      expect(result.agentShareholders).toBeNull();
    });

    it('should return null lastSettlementAt when merchant has never settled', async () => {
      mockPrisma.merchant.findUniqueOrThrow.mockResolvedValue({
        id: 3,
        settlementInterval: 30,
        lastSettlementAt: null,
      });
      mockPrisma.agentShareholder.findMany.mockResolvedValue([]);
      mockPrisma.baseFee.findMany.mockResolvedValue([]);

      const result = await service.findAllConfigByMerchantId(3);

      expect(result.lastSettlementAt).toBeNull();
    });

    it('should return null merchantFeeConfig when baseFee has no merchantFee', async () => {
      mockPrisma.merchant.findUniqueOrThrow.mockResolvedValue({
        id: 4,
        settlementInterval: 120,
        lastSettlementAt: new Date(),
      });
      mockPrisma.agentShareholder.findMany.mockResolvedValue([]);
      mockPrisma.baseFee.findMany.mockResolvedValue([
        {
          id: 1,
          code: 'X',
          providerName: 'PDN',
          paymentMethodName: 'QRIS',
          transactionType: TransactionTypeEnum.PURCHASE,
          feeProviderFixed: new Decimal(0),
          feeProviderPercentage: new Decimal(0),
          isActive: true,
          merchantFees: [],
        },
      ]);

      const result = await service.findAllConfigByMerchantId(4);

      expect(result.fees[0].merchantFeeConfig).toBeNull();
    });

    it('should throw when merchant not found', async () => {
      mockPrisma.merchant.findUniqueOrThrow.mockRejectedValue(
        new Error('No Merchant found'),
      );

      await expect(service.findAllConfigByMerchantId(999)).rejects.toThrow(
        'No Merchant found',
      );
    });
  });

  describe('create', () => {
    it('should create merchant and initial shareholder with provided settlementInterval', async () => {
      const dto = { id: 1, settlementInterval: 100, agentId: 2 };

      await service.create(dto as any);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.merchant.create).toHaveBeenCalledWith({
        data: { id: 1, settlementInterval: 100 },
      });
      expect(mockPrisma.agentShareholder.create).toHaveBeenCalledWith({
        data: {
          percentagePerAgent: new Decimal(0),
          agentId: 2,
          merchantId: 1,
        },
      });
    });

    it('should use default settlementInterval of 120 when null', async () => {
      const dto = { id: 5, settlementInterval: null, agentId: 3 };

      await service.create(dto as any);

      expect(mockPrisma.merchant.create).toHaveBeenCalledWith({
        data: { id: 5, settlementInterval: 120 },
      });
    });

    it('should throw when transaction fails', async () => {
      mockPrisma.$transaction.mockRejectedValueOnce(
        new Error('Transaction failed'),
      );

      await expect(
        service.create({ id: 99, agentId: 1 } as any),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('upsertProvider', () => {
    it('should process 3 mixed actions (U, U, D)', async () => {
      const body = [
        {
          action: ActionEnum.U,
          baseFeeId: 1,
          feeInternalFixed: new Decimal(100),
          feeInternalPercentage: new Decimal(1),
          feeAgentFixed: new Decimal(50),
          feeAgentPercentage: new Decimal(0.5),
        },
        {
          action: ActionEnum.U,
          baseFeeId: 2,
          feeInternalFixed: new Decimal(200),
          feeInternalPercentage: new Decimal(2),
          feeAgentFixed: new Decimal(0),
          feeAgentPercentage: new Decimal(0),
        },
        {
          action: ActionEnum.D,
          baseFeeId: 3,
          feeInternalFixed: new Decimal(0),
          feeInternalPercentage: new Decimal(0),
          feeAgentFixed: null,
          feeAgentPercentage: null,
        },
      ];

      await service.upsertProvider(1, body as any);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.merchantFee.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.merchantFee.delete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.merchantFee.delete).toHaveBeenCalledWith({
        where: { merchantId_baseFeeId: { baseFeeId: 3, merchantId: 1 } },
      });
    });

    it('should upsert with correct arguments including nullable feeAgent fields', async () => {
      const body = [
        {
          action: ActionEnum.U,
          baseFeeId: 1,
          feeInternalFixed: new Decimal(100),
          feeInternalPercentage: new Decimal(1),
          feeAgentFixed: new Decimal(50),
          feeAgentPercentage: new Decimal(0.5),
        },
      ];

      await service.upsertProvider(1, body as any);

      expect(mockPrisma.merchantFee.upsert).toHaveBeenCalledWith({
        create: {
          merchantId: 1,
          baseFeeId: 1,
          feeInternalFixed: new Decimal(100),
          feeInternalPercentage: new Decimal(1),
          feeAgentFixed: new Decimal(50),
          feeAgentPercentage: new Decimal(0.5),
        },
        where: { merchantId_baseFeeId: { baseFeeId: 1, merchantId: 1 } },
        update: {
          feeInternalFixed: new Decimal(100),
          feeInternalPercentage: new Decimal(1),
          feeAgentFixed: new Decimal(50),
          feeAgentPercentage: new Decimal(0.5),
        },
      });
    });

    it('should default feeAgent to Decimal(0) when nullable fields are null', async () => {
      const body = [
        {
          action: ActionEnum.U,
          baseFeeId: 1,
          feeInternalFixed: new Decimal(100),
          feeInternalPercentage: new Decimal(1),
          feeAgentFixed: null,
          feeAgentPercentage: null,
        },
      ];

      await service.upsertProvider(1, body as any);

      expect(mockPrisma.merchantFee.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            feeAgentFixed: new Decimal(0),
            feeAgentPercentage: new Decimal(0),
          }),
          update: expect.objectContaining({
            feeAgentFixed: new Decimal(0),
            feeAgentPercentage: new Decimal(0),
          }),
        }),
      );
    });

    it('should process delete action correctly', async () => {
      const body = [{ action: ActionEnum.D, baseFeeId: 5 }];

      await service.upsertProvider(1, body as any);

      expect(mockPrisma.merchantFee.delete).toHaveBeenCalledWith({
        where: { merchantId_baseFeeId: { baseFeeId: 5, merchantId: 1 } },
      });
    });
  });

  describe('upsertAgentShareholder', () => {
    it('should throw ResponseException if percentages do not sum to 100', () => {
      const body = [
        {
          action: ActionEnum.U,
          agentId: 1,
          percentagePerAgent: new Decimal(50),
        },
      ];

      expect(() => service.upsertAgentShareholder(1, body as any)).toThrow(
        ResponseException,
      );
    });

    it('should include percentage sum in error responseDto message', () => {
      const body = [
        {
          action: ActionEnum.U,
          agentId: 1,
          percentagePerAgent: new Decimal(30),
        },
        {
          action: ActionEnum.U,
          agentId: 2,
          percentagePerAgent: new Decimal(20),
        },
      ];

      try {
        service.upsertAgentShareholder(1, body as any);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseException);
        const responseDto = (error as ResponseException).getResponseDto();
        expect(responseDto.message).toContain(
          'Sum of fee percentage must be 100%',
        );
      }
    });

    it('should process 3 valid shareholders (2 upsert, 1 delete)', async () => {
      const body = [
        {
          action: ActionEnum.U,
          agentId: 10,
          percentagePerAgent: new Decimal(60),
        },
        {
          action: ActionEnum.U,
          agentId: 11,
          percentagePerAgent: new Decimal(40),
        },
        {
          action: ActionEnum.D,
          agentId: 12,
          percentagePerAgent: new Decimal(0),
        },
      ];

      await service.upsertAgentShareholder(1, body as any);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.agentShareholder.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.agentShareholder.delete).toHaveBeenCalledTimes(1);
    });

    it('should call upsert with correct arguments', async () => {
      const body = [
        {
          action: ActionEnum.U,
          agentId: 10,
          percentagePerAgent: new Decimal(100),
        },
      ];

      await service.upsertAgentShareholder(1, body as any);

      expect(mockPrisma.agentShareholder.upsert).toHaveBeenCalledWith({
        create: {
          merchantId: 1,
          agentId: 10,
          percentagePerAgent: new Decimal(100),
        },
        where: { agentId_merchantId: { agentId: 10, merchantId: 1 } },
        update: { percentagePerAgent: new Decimal(100) },
      });
    });

    it('should call delete with correct arguments', async () => {
      const body = [
        {
          action: ActionEnum.U,
          agentId: 10,
          percentagePerAgent: new Decimal(100),
        },
        {
          action: ActionEnum.D,
          agentId: 11,
          percentagePerAgent: new Decimal(0),
        },
      ];

      await service.upsertAgentShareholder(1, body as any);

      expect(mockPrisma.agentShareholder.delete).toHaveBeenCalledWith({
        where: { agentId_merchantId: { agentId: 11, merchantId: 1 } },
      });
    });

    it('should exclude delete actions from percentage validation', async () => {
      // Two UPSERTs sum to 100, one DELETE with percentagePerAgent 50 should be excluded
      const body = [
        {
          action: ActionEnum.U,
          agentId: 10,
          percentagePerAgent: new Decimal(60),
        },
        {
          action: ActionEnum.U,
          agentId: 11,
          percentagePerAgent: new Decimal(40),
        },
        {
          action: ActionEnum.D,
          agentId: 12,
          percentagePerAgent: new Decimal(50),
        },
      ];

      // Should NOT throw because delete actions are filtered out
      await expect(
        service.upsertAgentShareholder(1, body as any),
      ).resolves.not.toThrow();
    });
  });
});
