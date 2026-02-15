import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawFeeService } from './withdraw-fee.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { TransactionTypeEnum } from '@prisma/client';

describe('WithdrawFeeService', () => {
  let service: WithdrawFeeService;

  const mockPrismaService = {
    baseFee: {
      findFirstOrThrow: jest.fn(),
    },
    merchantFee: {
      findUniqueOrThrow: jest.fn(),
    },
    agentShareholder: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawFeeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WithdrawFeeService>(WithdrawFeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateWithdrawFee', () => {
    const filter = {
      merchantId: 1,
      providerName: 'PDN',
      paymentMethodName: 'TRANSFERBANK',
      nominal: new Decimal(10000),
    };

    const fullBaseFee = {
      id: 3,
      code: 'WIT-TRANSFER-PDN',
      providerName: 'PDN',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: TransactionTypeEnum.WITHDRAW,
      feeProviderFixed: new Decimal(100),
      feeProviderPercentage: new Decimal(1),
      isActive: true,
    };

    const fullMerchantFee = {
      id: 3,
      merchantId: 1,
      baseFeeId: 3,
      feeInternalFixed: new Decimal(200),
      feeInternalPercentage: new Decimal(2),
      feeAgentFixed: new Decimal(50),
      feeAgentPercentage: new Decimal(0.5),
    };

    it('should calculate fees with 3 agent shareholders (adding to nominal)', async () => {
      const shareholders = [
        { agent: { id: 10 }, percentagePerAgent: new Decimal(40) },
        { agent: { id: 11 }, percentagePerAgent: new Decimal(35) },
        { agent: { id: 12 }, percentagePerAgent: new Decimal(25) },
      ];

      mockPrismaService.baseFee.findFirstOrThrow.mockResolvedValue(fullBaseFee);
      mockPrismaService.merchantFee.findUniqueOrThrow.mockResolvedValue(
        fullMerchantFee,
      );
      mockPrismaService.agentShareholder.findMany.mockResolvedValue(
        shareholders,
      );

      const result = await service.calculateWithdrawFee(filter as any);

      // Provider fee: 100 + (10000 * 1/100) = 200
      expect(result.providerFee.nominal.toNumber()).toBe(200);
      expect(result.providerFee.name).toBe('PDN');
      expect(result.providerFee.feeFixed).toEqual(new Decimal(100));
      expect(result.providerFee.feePercentage).toEqual(new Decimal(1));

      // Internal fee: 200 + (10000 * 2/100) = 400
      expect(result.internalFee.nominal.toNumber()).toBe(400);
      expect(result.internalFee.feeFixed).toEqual(new Decimal(200));
      expect(result.internalFee.feePercentage).toEqual(new Decimal(2));

      // Agent fee total: 50 + (10000 * 0.5/100) = 100
      expect(result.agentFee.nominal.toNumber()).toBe(100);
      expect(result.agentFee.feeFixed).toEqual(new Decimal(50));
      expect(result.agentFee.feePercentage).toEqual(new Decimal(0.5));

      // Agent shares: 40% of 100 = 40, 35% of 100 = 35, 25% of 100 = 25
      expect(result.agentFee.agents).toHaveLength(3);
      expect(result.agentFee.agents[0].id).toBe(10);
      expect(result.agentFee.agents[0].nominal.toNumber()).toBe(40);
      expect(result.agentFee.agents[0].feePercentage).toEqual(new Decimal(40));
      expect(result.agentFee.agents[1].id).toBe(11);
      expect(result.agentFee.agents[1].nominal.toNumber()).toBe(35);
      expect(result.agentFee.agents[2].id).toBe(12);
      expect(result.agentFee.agents[2].nominal.toNumber()).toBe(25);

      // Merchant net: 10000 + 200 + 400 + 100 = 10700 (withdraw adds fees)
      expect(result.merchantFee.netNominal.toNumber()).toBe(10700);
      expect(result.merchantFee.id).toBe(1);
      expect(result.merchantFee.nominal.toNumber()).toBe(10000);
      // Percentage: 10700 / 10000 * 100 = 107
      expect(result.merchantFee.feePercentage.toNumber()).toBe(107);

      expect(mockPrismaService.baseFee.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          providerName: 'PDN',
          paymentMethodName: 'TRANSFERBANK',
          transactionType: TransactionTypeEnum.WITHDRAW,
        },
      });
    });

    it('should calculate fees without agents when agent fees are zero', async () => {
      const noAgentMerchantFee = {
        ...fullMerchantFee,
        feeAgentFixed: new Decimal(0),
        feeAgentPercentage: new Decimal(0),
      };

      mockPrismaService.baseFee.findFirstOrThrow.mockResolvedValue(fullBaseFee);
      mockPrismaService.merchantFee.findUniqueOrThrow.mockResolvedValue(
        noAgentMerchantFee,
      );

      const result = await service.calculateWithdrawFee(filter as any);

      expect(result.agentFee.agents).toHaveLength(0);
      expect(result.agentFee.nominal.toNumber()).toBe(0);
      // Net: 10000 + 200 + 400 + 0 = 10600
      expect(result.merchantFee.netNominal.toNumber()).toBe(10600);
      expect(
        mockPrismaService.agentShareholder.findMany,
      ).not.toHaveBeenCalled();
    });

    it('should throw when baseFee is not found', async () => {
      mockPrismaService.baseFee.findFirstOrThrow.mockRejectedValue(
        new Error('No BaseFee found'),
      );

      await expect(service.calculateWithdrawFee(filter as any)).rejects.toThrow(
        'No BaseFee found',
      );
    });

    it('should throw when merchantFee is not found', async () => {
      mockPrismaService.baseFee.findFirstOrThrow.mockResolvedValue(fullBaseFee);
      mockPrismaService.merchantFee.findUniqueOrThrow.mockRejectedValue(
        new Error('No MerchantFee found'),
      );

      await expect(service.calculateWithdrawFee(filter as any)).rejects.toThrow(
        'No MerchantFee found',
      );
    });
  });
});
