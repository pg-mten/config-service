import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserAuthClient } from 'src/microservice/auth/user.auth.client';

describe('AgentService', () => {
  let service: AgentService;

  const mockPrismaService = {
    agent: {
      create: jest.fn(),
    },
    agentShareholder: {
      findMany: jest.fn(),
    },
  };

  const mockUserAuthClient = {
    findAllMerchantsAndAgentsByIdsTCP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserAuthClient, useValue: mockUserAuthClient },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an agent and return the result', async () => {
      const dto = { id: 1 };
      const createdAgent = {
        id: 1,
        providerName: null,
        paymentMethodName: null,
      };
      mockPrismaService.agent.create.mockResolvedValue(createdAgent);

      const result = await service.create(dto as any);

      expect(mockPrismaService.agent.create).toHaveBeenCalledWith({
        data: { id: 1 },
      });
      expect(result).toEqual(createdAgent);
    });

    it('should throw when prisma.agent.create fails', async () => {
      const dto = { id: 999 };
      mockPrismaService.agent.create.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(service.create(dto as any)).rejects.toThrow(
        'Unique constraint failed',
      );
    });
  });

  describe('findMerchantByAgentId', () => {
    it('should return 3 merchants for agent with 3 shareholders', async () => {
      const agentId = 1;
      const shareholders = [
        { merchantId: 10 },
        { merchantId: 20 },
        { merchantId: 30 },
      ];
      const merchants = [
        {
          merchantId: 10,
          userId: 10,
          email: 'alpha@test.com',
          ownerName: 'Alpha Owner',
          businessName: 'Alpha Biz',
          brandName: 'Alpha',
          phoneNumber: '081',
          nik: '123',
          ktpImage: 'ktp.jpg',
          npwp: '456',
          address: 'Addr1',
          province: 'P1',
          regency: 'R1',
          district: 'D1',
          village: 'V1',
          postalCode: '10001',
          bankCode: 'BCA',
          bankName: 'BCA',
          accountNumber: '111',
          accountHolderName: 'Alpha',
          siupFile: null,
          coordinate: null,
        },
        {
          merchantId: 20,
          userId: 20,
          email: 'beta@test.com',
          ownerName: 'Beta Owner',
          businessName: 'Beta Biz',
          brandName: 'Beta',
          phoneNumber: '082',
          nik: '789',
          ktpImage: null,
          npwp: '012',
          address: 'Addr2',
          province: 'P2',
          regency: 'R2',
          district: 'D2',
          village: 'V2',
          postalCode: '10002',
          bankCode: 'BNI',
          bankName: 'BNI',
          accountNumber: '222',
          accountHolderName: 'Beta',
          siupFile: 'siup.pdf',
          coordinate: '1,2',
        },
        {
          merchantId: 30,
          userId: 30,
          email: 'gamma@test.com',
          ownerName: 'Gamma Owner',
          businessName: 'Gamma Biz',
          brandName: 'Gamma',
          phoneNumber: '083',
          nik: '345',
          ktpImage: null,
          npwp: '678',
          address: 'Addr3',
          province: 'P3',
          regency: 'R3',
          district: 'D3',
          village: 'V3',
          postalCode: '10003',
          bankCode: 'BRI',
          bankName: 'BRI',
          accountNumber: '333',
          accountHolderName: 'Gamma',
          siupFile: null,
          coordinate: null,
        },
      ];

      mockPrismaService.agentShareholder.findMany.mockResolvedValue(
        shareholders,
      );
      mockUserAuthClient.findAllMerchantsAndAgentsByIdsTCP.mockResolvedValue({
        data: { merchants },
      });

      const result = await service.findMerchantByAgentId(agentId);

      expect(mockPrismaService.agentShareholder.findMany).toHaveBeenCalledWith({
        where: { agentId },
        select: { merchantId: true },
      });
      expect(
        mockUserAuthClient.findAllMerchantsAndAgentsByIdsTCP,
      ).toHaveBeenCalledWith({
        merchantIds: '10,20,30',
        agentIds: '',
      });
      expect(result).toHaveLength(3);
      expect(result[0].merchantId).toBe(10);
      expect(result[0].email).toBe('alpha@test.com');
      expect(result[0].businessName).toBe('Alpha Biz');
      expect(result[0].ktpImage).toBe('ktp.jpg');
      expect(result[1].merchantId).toBe(20);
      expect(result[1].siupFile).toBe('siup.pdf');
      expect(result[2].merchantId).toBe(30);
      expect(result[2].coordinate).toBeNull();
    });

    it('should return empty list when agent has no shareholders', async () => {
      mockPrismaService.agentShareholder.findMany.mockResolvedValue([]);
      mockUserAuthClient.findAllMerchantsAndAgentsByIdsTCP.mockResolvedValue({
        data: { merchants: [] },
      });

      const result = await service.findMerchantByAgentId(99);

      expect(result).toEqual([]);
    });

    it('should return empty list when TCP response data is null', async () => {
      mockPrismaService.agentShareholder.findMany.mockResolvedValue([]);
      mockUserAuthClient.findAllMerchantsAndAgentsByIdsTCP.mockResolvedValue({
        data: null,
      });

      const result = await service.findMerchantByAgentId(1);

      expect(result).toEqual([]);
    });

    it('should throw when agentShareholder.findMany fails', async () => {
      mockPrismaService.agentShareholder.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.findMerchantByAgentId(1)).rejects.toThrow(
        'DB error',
      );
    });

    it('should throw when TCP call fails', async () => {
      mockPrismaService.agentShareholder.findMany.mockResolvedValue([
        { merchantId: 1 },
      ]);
      mockUserAuthClient.findAllMerchantsAndAgentsByIdsTCP.mockRejectedValue(
        new Error('TCP connection refused'),
      );

      await expect(service.findMerchantByAgentId(1)).rejects.toThrow(
        'TCP connection refused',
      );
    });
  });
});
