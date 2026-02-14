import { Test, TestingModule } from '@nestjs/testing';
import { SettlementSchedulerService } from './settlement-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettlementSettleReconClient } from 'src/microservice/settlerecon/settlement.settlerecon.client';
import { DateHelper } from 'src/shared/helper/date.helper';
import { DateTime } from 'luxon';

describe('SettlementSchedulerService', () => {
  let service: SettlementSchedulerService;

  const mockPrisma: any = {
    merchant: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  mockPrisma.$transaction = jest
    .fn()
    .mockImplementation((cb) => cb(mockPrisma) as unknown);

  const mockSettlementClient = {
    scheduleTCP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementSchedulerService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: SettlementSettleReconClient,
          useValue: mockSettlementClient,
        },
      ],
    }).compile();

    service = module.get<SettlementSchedulerService>(
      SettlementSchedulerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runForInterval', () => {
    it('should process 3 eligible merchants and verify TCP arguments', async () => {
      const now = DateTime.now();
      jest.spyOn(DateHelper, 'now').mockReturnValue(now);

      const mockMerchants = [
        { id: 1, settlementInterval: 60, lastSettlementAt: null },
        {
          id: 2,
          settlementInterval: 60,
          lastSettlementAt: new Date('2026-01-01'),
        },
        {
          id: 3,
          settlementInterval: 60,
          lastSettlementAt: new Date('2026-01-10'),
        },
      ];
      mockPrisma.merchant.findMany.mockResolvedValue(mockMerchants);
      mockSettlementClient.scheduleTCP.mockResolvedValue({
        data: { merchantIds: [1, 2, 3], merchantIdsNoSettlement: [] },
      });

      await service.runForInterval(60);

      // Verify scheduleTCP was called with correct arguments
      expect(mockSettlementClient.scheduleTCP).toHaveBeenCalledWith({
        date: now,
        interval: 60,
        merchantIds: '1,2,3',
      });

      // Verify each merchant.update was called with correct ID
      expect(mockPrisma.merchant.update).toHaveBeenCalledTimes(3);
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { lastSettlementAt: now.toJSDate() },
      });
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { lastSettlementAt: now.toJSDate() },
      });
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { lastSettlementAt: now.toJSDate() },
      });
    });

    it('should do nothing if no merchants found', async () => {
      mockPrisma.merchant.findMany.mockResolvedValue([]);

      await service.runForInterval(60);

      expect(mockSettlementClient.scheduleTCP).not.toHaveBeenCalled();
    });

    it('should only update merchants that were settled (partial settlement)', async () => {
      const now = DateTime.now();
      jest.spyOn(DateHelper, 'now').mockReturnValue(now);

      const mockMerchants = [
        { id: 1, settlementInterval: 30, lastSettlementAt: null },
        { id: 2, settlementInterval: 30, lastSettlementAt: null },
        { id: 3, settlementInterval: 30, lastSettlementAt: null },
      ];
      mockPrisma.merchant.findMany.mockResolvedValue(mockMerchants);
      // Only merchant 1 and 3 were actually settled; merchant 2 had no settlement
      mockSettlementClient.scheduleTCP.mockResolvedValue({
        data: { merchantIds: [1, 3], merchantIdsNoSettlement: [2] },
      });

      await service.runForInterval(30);

      // Only merchants returned in merchantIds should be updated
      expect(mockPrisma.merchant.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { lastSettlementAt: now.toJSDate() },
      });
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { lastSettlementAt: now.toJSDate() },
      });
    });

    it('should throw when scheduleTCP fails', async () => {
      const now = DateTime.now();
      jest.spyOn(DateHelper, 'now').mockReturnValue(now);

      mockPrisma.merchant.findMany.mockResolvedValue([
        { id: 1, settlementInterval: 60, lastSettlementAt: null },
      ]);
      mockSettlementClient.scheduleTCP.mockRejectedValue(
        new Error('TCP connection refused'),
      );

      await expect(service.runForInterval(60)).rejects.toThrow(
        'TCP connection refused',
      );
    });
  });
});
