import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MerchantConfigDto } from './dto/merchant-config.dto';
import { CreateMerchantAgentFeeDto } from './dto/create-merchant-agent-fee.dto';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateMerchantAgentFeeDto } from './dto/update-merchant-agent-fee';
import { CreateMerchantAgentShareholderDto } from './dto/create-merchant-agent-shareholder.dto';
import { ResponseException } from 'src/exception/response.exception';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  findById(merchantId: number) {
    return this.prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
    });
  }

  async findAllConfig(merchantId: number) {
    /**
     * Agent
     * Provider
     * Payment Method
     */
    const agentFees = await this.prisma.agentFee.findMany({
      where: { merchantId: merchantId },
    });
    const providers: MerchantConfigDto[] = [];
    for (const agentFee of agentFees) {
      const internalFee = await this.prisma.internalFee.findFirstOrThrow({
        where: {
          id: agentFee.internalFeeId,
        },
        include: { providerFee: true },
      });
      const providerFee = internalFee.providerFee;
      providers.push(
        new MerchantConfigDto({
          internalFeeId: internalFee.id,
          internalPercentage: internalFee.percentageInternal,
          provider: providerFee.providerName,
          paymentMethod: providerFee.paymentMethodName,
          providerPercentage: providerFee.percentageProvider,
          agentPercentage: agentFee.percentageForAgent ?? new Decimal(0),
        }),
      );
    }
    providers.sort((a, b) => a.provider.localeCompare(b.provider));
    return providers;
  }

  createProvider(merchantId: number, body: CreateMerchantAgentFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.agentFee.createManyAndReturn({
        data: body.map((data) => {
          return {
            internalFeeId: data.internalFeeId,
            merchantId: merchantId,
            percentageForAgent: data.percentageForAgent,
          } as Prisma.AgentFeeCreateManyInput;
        }),
      });
    });
  }

  updateProvider(merchantId: number, body: UpdateMerchantAgentFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const agentFee of body) {
        await tx.agentFee.update({
          where: {
            merchantId_internalFeeId: {
              merchantId: merchantId,
              internalFeeId: agentFee.internalFeeId,
            },
          },
          data: { percentageForAgent: agentFee.percentageForAgent },
        });
      }
    });
  }

  createAgentShareholder(
    merchantId: number,
    body: CreateMerchantAgentShareholderDto[],
  ) {
    this.agentShareholderValidity(
      body.map((e) => e.percentagePerAgent as Decimal),
    );
    return this.prisma.$transaction(async (tx) => {
      await tx.agentShareholder.createManyAndReturn({
        data: body.map((data) => {
          return {
            agentId: data.agentId,
            merchantId: merchantId,
            percentagePerAgent: data.percentagePerAgent,
          } as Prisma.AgentShareholderCreateManyInput;
        }),
      });
    });
  }

  updateAgentShareholder(
    merchantId: number,
    body: CreateMerchantAgentShareholderDto[],
  ) {
    this.agentShareholderValidity(
      body.map((e) => e.percentagePerAgent as Decimal),
    );
    return this.prisma.$transaction(async (tx) => {
      for (const agentShareholder of body) {
        await tx.agentShareholder.update({
          where: {
            agentId_merchantId: {
              agentId: agentShareholder.agentId,
              merchantId: merchantId,
            },
          },
          data: {
            percentagePerAgent: agentShareholder.percentagePerAgent,
          },
        });
      }
    });
  }

  private agentShareholderValidity(percentages: Decimal[]) {
    /// Agent Shareholder Percentage sum must be 100%
    const totalPercentage: Decimal = percentages.reduce<Decimal>(
      (prev, curr) => {
        return prev.plus(curr);
      },
      new Decimal(0),
    );

    if (totalPercentage.equals(new Decimal(100))) {
      throw ResponseException.fromHttpExecption(
        new UnprocessableEntityException(`Sum of fee percentage must be 100%`),
        {
          logic: `Current Sum of fee percentage [${totalPercentage.toFixed(2)}]`,
        },
      );
    }
  }
}
