import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { MerchantFeeDto } from '../fee/dto/merchant-fee.dto';
import { AgentFeeDto } from '../fee/dto/agent-fee.dto';
import { AgentDto } from '../agent/dto/agent.dto';
import { ProviderFeeDto } from '../fee/dto/provider-fee.dto';
import { InternalFeeDto } from '../fee/dto/internal-fee.dto';
import { PurchasingFeeDto } from '../fee/dto/purchashing-fee.dto';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyFeeConfig() {
    const merchantId = 1;
    const providerId = 1; /// BCA
    const paymentMethodId = 1; /// QRIS
    const nominal: Decimal = new Decimal(100);

    /// Find how many agent and its percentage each
    const merchant = await this.prisma.merchant.findUniqueOrThrow({
      where: { id: merchantId },
    });

    const merchantAgentMany = await this.prisma.merchantAgentFee.findMany({
      where: { merchantId: merchantId },
      include: { agent: true },
    });

    /// Calculate agent fee
    const agentFeeTotal = nominal.mul(
      merchant.percentageForAgent.dividedBy(100),
    );

    /// Find Provider fee
    const providerPaymentMethod =
      await this.prisma.providerPaymentMethodFee.findUniqueOrThrow({
        where: {
          providerId_paymentMethodId: {
            providerId,
            paymentMethodId,
          },
        },
        include: { provider: true },
      });

    const merchantProviderFee =
      await this.prisma.merchantProviderFee.findUniqueOrThrow({
        where: {
          merchantId_providerPaymentMethodFeeId: {
            merchantId,
            providerPaymentMethodFeeId: providerPaymentMethod.id,
          },
        },
      });

    /// Calculate Provider fee
    const providerFee = nominal.mul(
      providerPaymentMethod.percentageProvider.dividedBy(100),
    );

    /// Find Internal Fee
    const internal = await this.prisma.internalFee.findUniqueOrThrow({
      where: {
        merchantProviderFeeId: merchantProviderFee.id,
      },
    });

    /// Calculate Internal Fee
    const internalFee = nominal.mul(internal.percentageInternal.dividedBy(100));

    /// Calculate Merchant net amount
    const merchantNetAmount = nominal
      .sub(agentFeeTotal)
      .sub(providerFee)
      .sub(internalFee);

    const agents = merchantAgentMany.map((merchantAgentMany) => {
      return new AgentDto({
        id: merchantAgentMany.agent.id,
        name: merchantAgentMany.agent.name,
        nominal: agentFeeTotal.mul(
          merchantAgentMany.percentagePerAgent.dividedBy(100),
        ),
        percentage: merchantAgentMany.percentagePerAgent,
      });
    });

    const agentFeeDto = new AgentFeeDto({
      nominal: agentFeeTotal,
      percentage: merchant.percentageForAgent,
      agents: agents,
    });

    const providerFeeDto = new ProviderFeeDto({
      id: providerId,
      name: providerPaymentMethod.provider.name,
      nominal: providerFee,
      percentage: providerPaymentMethod.percentageProvider,
    });

    const internalFeeDto = new InternalFeeDto({
      id: internal.id,
      nominal: internalFee,
      percentage: internal.percentageInternal,
    });

    const merchantPercentage = new Decimal(100)
      .sub(merchant.percentageForAgent)
      .sub(providerPaymentMethod.percentageProvider)
      .sub(internal.percentageInternal);

    const merchantFeeDto = new MerchantFeeDto({
      id: merchant.id,
      merchantNetAmount: merchantNetAmount,
      name: merchant.name,
      nominal: nominal,
      percentage: merchantPercentage,
    });

    return new PurchasingFeeDto({
      agent: agentFeeDto,
      internal: internalFeeDto,
      merchant: merchantFeeDto,
      provider: providerFeeDto,
    });
  }
}
