import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommonDiv } from 'src/shared/constant/fee.constant';
import { TransactionTypeEnum } from '@prisma/client';

describe('CommonService', () => {
  let service: CommonService;

  const mockPrisma = {
    provider: {
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
    paymentMethod: {
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
    common: {
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
    bank: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommonService>(CommonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByDivAndValueThrow', () => {
    it('should call prisma.provider.findFirstOrThrow when div is PROVIDER', async () => {
      const mockProvider = {
        id: 1,
        name: 'PDN',
        reconciliationTime: '08:00',
        lastReconciliationAt: null,
      };
      mockPrisma.provider.findFirstOrThrow.mockResolvedValue(mockProvider);

      const result = await service.findByDivAndValueThrow(
        CommonDiv.PROVIDER,
        'PDN',
      );

      expect(mockPrisma.provider.findFirstOrThrow).toHaveBeenCalledWith({
        where: { name: 'PDN' },
      });
      expect(result).toEqual(mockProvider);
      expect((result as any).name).toBe('PDN');
    });

    it('should call prisma.paymentMethod.findFirstOrThrow when div is PAYMENT_METHOD', async () => {
      const mockPaymentMethod = { id: 1, name: 'QRIS', explain: 'QR Payment' };
      mockPrisma.paymentMethod.findFirstOrThrow.mockResolvedValue(
        mockPaymentMethod,
      );

      const result = await service.findByDivAndValueThrow(
        CommonDiv.PAYMENT_METHOD,
        'QRIS',
      );

      expect(mockPrisma.paymentMethod.findFirstOrThrow).toHaveBeenCalledWith({
        where: { name: 'QRIS' },
      });
      expect(result).toEqual(mockPaymentMethod);
      expect((result as any).name).toBe('QRIS');
    });

    it('should call prisma.common.findFirstOrThrow for other div values', async () => {
      const mockCommon = { id: 1, div: CommonDiv.BANK, value: 'BCA' };
      mockPrisma.common.findFirstOrThrow.mockResolvedValue(mockCommon);

      const result = await service.findByDivAndValueThrow(
        CommonDiv.BANK,
        'BCA',
      );

      expect(mockPrisma.common.findFirstOrThrow).toHaveBeenCalledWith({
        where: { div: CommonDiv.BANK, value: 'BCA' },
      });
      expect(result).toEqual(mockCommon);
    });

    it('should throw when provider not found', async () => {
      mockPrisma.provider.findFirstOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.findByDivAndValueThrow(CommonDiv.PROVIDER, 'NONEXISTENT'),
      ).rejects.toThrow('Not found');
    });

    it('should throw when payment method not found', async () => {
      mockPrisma.paymentMethod.findFirstOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.findByDivAndValueThrow(CommonDiv.PAYMENT_METHOD, 'NONEXISTENT'),
      ).rejects.toThrow('Not found');
    });

    it('should throw when common not found', async () => {
      mockPrisma.common.findFirstOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.findByDivAndValueThrow(CommonDiv.BANK, 'NONEXISTENT'),
      ).rejects.toThrow('Not found');
    });
  });

  describe('findManyByDiv', () => {
    it('should return 3 banks when div is BANK', async () => {
      const mockBanks = [
        { code: 'BCA', name: 'Bank Central Asia' },
        { code: 'BNI', name: 'Bank Negara Indonesia' },
        { code: 'BRI', name: 'Bank Rakyat Indonesia' },
      ];
      mockPrisma.bank.findMany.mockResolvedValue(mockBanks);

      const result = await service.findManyByDiv({
        div: CommonDiv.BANK,
      } as any);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('BCA');
      expect(result[0].explain).toBe('Bank Central Asia');
      expect(result[1].name).toBe('BNI');
      expect(result[2].name).toBe('BRI');
      expect(mockPrisma.bank.findMany).toHaveBeenCalled();
    });

    it('should return 3 providers excluding INTERNAL when div is PROVIDER', async () => {
      const mockProviders = [
        { name: 'PDN' },
        { name: 'INACASH' },
        { name: 'INTERNAL' },
        { name: 'NETZME' },
      ];
      mockPrisma.provider.findMany.mockResolvedValue(mockProviders);

      const result = await service.findManyByDiv({
        div: CommonDiv.PROVIDER,
      } as any);

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.name)).toEqual(['PDN', 'INACASH', 'NETZME']);
      expect(result.find((r) => r.name === 'INTERNAL')).toBeUndefined();
    });

    it('should return hardcoded INTERNAL when div is PROVIDER_TOPUP', async () => {
      const result = await service.findManyByDiv({
        div: CommonDiv.PROVIDER_TOPUP,
      } as any);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('INTERNAL');
      expect(result[0].explain).toBe('INTERNAL');
    });

    it('should return 3 payment methods when div is PAYMENT_METHOD', async () => {
      const mockPaymentMethods = [
        { name: 'QRIS', explain: 'QR Payment' },
        { name: 'TRANSFERBANK', explain: 'Bank Transfer' },
        { name: 'EWALLET', explain: 'E-Wallet' },
      ];
      mockPrisma.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);

      const result = await service.findManyByDiv({
        div: CommonDiv.PAYMENT_METHOD,
      } as any);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('QRIS');
      expect(result[0].explain).toBe('QR Payment');
      expect(result[1].name).toBe('TRANSFERBANK');
      expect(result[2].name).toBe('EWALLET');
    });

    it('should return filtered payment methods for PAYMENT_METHOD_PURCHASE', async () => {
      const mockPaymentMethods = [
        {
          name: 'QRIS',
          explain: 'QR Payment',
          transactionTypes: [TransactionTypeEnum.PURCHASE],
        },
        {
          name: 'TRANSFERBANK',
          explain: 'Bank Transfer',
          transactionTypes: [TransactionTypeEnum.PURCHASE],
        },
        {
          name: 'EWALLET',
          explain: 'E-Wallet',
          transactionTypes: [TransactionTypeEnum.PURCHASE],
        },
      ];
      mockPrisma.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);

      const result = await service.findManyByDiv({
        div: CommonDiv.PAYMENT_METHOD_PURCHASE,
      } as any);

      expect(result).toHaveLength(3);
      expect(mockPrisma.paymentMethod.findMany).toHaveBeenCalledWith({
        where: { transactionTypes: { has: TransactionTypeEnum.PURCHASE } },
      });
    });

    it('should return filtered payment methods for PAYMENT_METHOD_TOPUP', async () => {
      const mockPaymentMethods = [
        { name: 'TRANSFERBANK', explain: 'Bank Transfer' },
        { name: 'EWALLET', explain: 'E-Wallet' },
        { name: 'VA', explain: 'Virtual Account' },
      ];
      mockPrisma.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);

      const result = await service.findManyByDiv({
        div: CommonDiv.PAYMENT_METHOD_TOPUP,
      } as any);

      expect(result).toHaveLength(3);
      expect(mockPrisma.paymentMethod.findMany).toHaveBeenCalledWith({
        where: { transactionTypes: { has: TransactionTypeEnum.TOPUP } },
      });
    });

    it('should return filtered payment methods for PAYMENT_METHOD_WITHDRAW', async () => {
      const mockPaymentMethods = [
        { name: 'TRANSFERBANK', explain: 'Bank Transfer' },
        { name: 'EWALLET', explain: 'E-Wallet' },
        { name: 'VA', explain: 'Virtual Account' },
      ];
      mockPrisma.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);

      const result = await service.findManyByDiv({
        div: CommonDiv.PAYMENT_METHOD_WITHDRAW,
      } as any);

      expect(result).toHaveLength(3);
      expect(mockPrisma.paymentMethod.findMany).toHaveBeenCalledWith({
        where: { transactionTypes: { has: TransactionTypeEnum.WITHDRAW } },
      });
    });

    it('should return filtered payment methods for PAYMENT_METHOD_DISBURSEMENT', async () => {
      const mockPaymentMethods = [
        { name: 'TRANSFERBANK', explain: 'Bank Transfer' },
        { name: 'EWALLET', explain: 'E-Wallet' },
        { name: 'VA', explain: 'Virtual Account' },
      ];
      mockPrisma.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);

      const result = await service.findManyByDiv({
        div: CommonDiv.PAYMENT_METHOD_DISBURSEMENT,
      } as any);

      expect(result).toHaveLength(3);
      expect(mockPrisma.paymentMethod.findMany).toHaveBeenCalledWith({
        where: { transactionTypes: { has: TransactionTypeEnum.DISBURSEMENT } },
      });
    });
  });

  describe('divAndValueIsExist', () => {
    it('should return 3 matching records', async () => {
      const mockRecords = [
        { id: 1, div: 'BANK', value: 'BCA' },
        { id: 2, div: 'BANK', value: 'BNI' },
        { id: 3, div: 'BANK', value: 'BRI' },
      ];
      mockPrisma.common.findMany.mockResolvedValue(mockRecords);

      const result = await service.divAndValueIsExist('BANK', [
        'BCA',
        'BNI',
        'BRI',
      ]);

      expect(result).toHaveLength(3);
      expect(mockPrisma.common.findMany).toHaveBeenCalledWith({
        where: {
          div: 'BANK',
          value: { in: ['BCA', 'BNI', 'BRI'] },
        },
      });
    });

    it('should return empty array when no matches', async () => {
      mockPrisma.common.findMany.mockResolvedValue([]);

      const result = await service.divAndValueIsExist('BANK', ['NONEXISTENT']);

      expect(result).toHaveLength(0);
    });
  });
});
