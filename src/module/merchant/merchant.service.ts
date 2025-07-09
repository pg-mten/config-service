import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMerchantConfigDto } from './dto/query-merchant-config.dto';
import { MerchantConfigDto } from './dto/merchant-config.dto';

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

  async findAllConfig(query: QueryMerchantConfigDto) {
    const { merchantId } = query;
    /**
     * Agent
     * Provider
     * Payment Method
     *
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
          provider: providerFee.providerName,
          paymentMethod: providerFee.paymentMethodName,
          providerPercentage: providerFee.percentageProvider,
          internalPercentage: internalFee.percentageInternal,
          agentPercentage: agentFee.percentageForAgent,
        }),
      );
    }
    providers.sort((a, b) => a.provider.localeCompare(b.provider));
    return providers;
  }
}
