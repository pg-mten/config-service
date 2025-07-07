import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { MerchantFeeDto } from './dto/merchant-fee.dto';
import { AgentFeeDto } from '../agent/dto/agent-fee.dto';

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

    const agentFees = merchantAgentMany.map((merchantAgentMany) => {
      return {
        id: merchantAgentMany.agent.id,
        name: merchantAgentMany.agent.name,
        nominal: agentFeeTotal.mul(
          merchantAgentMany.percentagePerAgent.dividedBy(100),
        ),
      };
    });

    /// Find Provider fee
    const providerPaymentMethod =
      await this.prisma.providerPaymentMethodFee.findUniqueOrThrow({
        where: {
          providerId_paymentMethodId: {
            providerId,
            paymentMethodId,
          },
        },
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

    const obj = {
      nominal,
      merchantNetAmount,
      agentFeeTotal,
      agentFees: agentFees.map((e) => new AgentFeeDto(e)),
      providerFee,
      internalFee,
    };

    console.log(obj);

    const merchantFeeDto = new MerchantFeeDto(obj);

    console.log({ merchantFeeDto });
    return merchantFeeDto;
  }
}
