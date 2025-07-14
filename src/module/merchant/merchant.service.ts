import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MerchantConfigDto } from './dto/merchant-config.dto';
import { CreateMerchantFeeDto } from './dto/create-merchant-fee.dto';
import { Prisma } from '@prisma/client';

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
          agentPercentage: agentFee.percentageForAgent,
        }),
      );
    }
    providers.sort((a, b) => a.provider.localeCompare(b.provider));
    return providers;
  }

  create(merchantId: number, body: CreateMerchantFeeDto[]) {
    this.prisma.agentFee.createManyAndReturn({
      data: body.map((data) => {
        return {
          internalFeeId: data.internalFeeId,
          merchantId: merchantId,
          percentageForAgent: data.percentageForAgent,
        } as Prisma.AgentFeeCreateManyInput;
      }),
    });
  }
}
