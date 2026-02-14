import { Test, TestingModule } from '@nestjs/testing';
import { ReconciliationService } from './reconciliation.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';

describe('ReconciliationService', () => {
  let service: ReconciliationService;

  const mockPrisma = {
    provider: {
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReconciliationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReconciliationService>(ReconciliationService);
    // Mock logger to avoid cluttering output
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleReconciliationCheck', () => {
    it('should process 3 providers needing reconciliation', async () => {
      const mockProviders = [
        {
          name: 'PDN',
          reconciliationTime: '08:00',
          lastReconciliationAt: null,
        },
        {
          name: 'INACASH',
          reconciliationTime: '08:00',
          lastReconciliationAt: new Date('2026-01-01'),
        },
        {
          name: 'NETZME',
          reconciliationTime: '08:00',
          lastReconciliationAt: new Date('2026-01-10'),
        },
      ];
      mockPrisma.provider.findMany.mockResolvedValue(mockProviders);
      mockPrisma.provider.update.mockResolvedValue({});

      await service.handleReconciliationCheck();

      expect(mockPrisma.provider.update).toHaveBeenCalledTimes(3);
      expect(mockPrisma.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: 'PDN' },
          data: expect.objectContaining({
            lastReconciliationAt: expect.any(Date),
          }),
        }),
      );
      expect(mockPrisma.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: 'INACASH' } }),
      );
      expect(mockPrisma.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: 'NETZME' } }),
      );
    });

    it('should do nothing if no providers found', async () => {
      mockPrisma.provider.findMany.mockResolvedValue([]);

      await service.handleReconciliationCheck();

      expect(mockPrisma.provider.update).not.toHaveBeenCalled();
    });

    it('should continue processing other providers when one update fails', async () => {
      const mockProviders = [
        {
          name: 'PDN',
          reconciliationTime: '08:00',
          lastReconciliationAt: null,
        },
        {
          name: 'FAILING',
          reconciliationTime: '08:00',
          lastReconciliationAt: null,
        },
        {
          name: 'NETZME',
          reconciliationTime: '08:00',
          lastReconciliationAt: null,
        },
      ];
      mockPrisma.provider.findMany.mockResolvedValue(mockProviders);
      mockPrisma.provider.update
        .mockResolvedValueOnce({}) // PDN succeeds
        .mockRejectedValueOnce(new Error('DB error')) // FAILING fails
        .mockResolvedValueOnce({}); // NETZME succeeds

      await service.handleReconciliationCheck();

      // All 3 providers should have been attempted
      expect(mockPrisma.provider.update).toHaveBeenCalledTimes(3);
      // Error should have been logged
      expect(jest.spyOn(Logger.prototype, 'error')).toHaveBeenCalled();
    });
  });

  describe('runForProvider', () => {
    it('should run manual reconciliation and return message with all fields verified', async () => {
      const mockProvider = {
        name: 'PDN',
        reconciliationTime: '08:00',
        lastReconciliationAt: new Date('2026-01-15'),
      };
      mockPrisma.provider.findUnique.mockResolvedValue(mockProvider);
      const date = new Date('2026-02-01T10:00:00Z');

      const result = await service.runForProvider('PDN', date);

      expect(result).toBeDefined();
      expect(result.message).toContain('PDN');
      expect(result.message).toContain('2026-02-01');
      expect(mockPrisma.provider.findUnique).toHaveBeenCalledWith({
        where: { name: 'PDN' },
      });
    });

    it('should throw NotFoundException when provider not found', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      await expect(
        service.runForProvider('UNKNOWN', new Date()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with provider name in message', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      await expect(
        service.runForProvider('NONEXISTENT', new Date()),
      ).rejects.toThrow('Provider with id NONEXISTENT not found');
    });
  });
});
