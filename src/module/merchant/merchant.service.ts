import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyFeeConfig() {
    const merchantId = 1;
    const providerId = 1; /// BCA
    const paymentMethodId = 1; /// QRIS
    const nominal: Decimal = new Decimal(100);

    /// Find how many agent and its percentage each
    const merchant = await this.prisma.merchantFee.findUniqueOrThrow({
      where: { merchantId },
    });

    const merchantAgentMany = await this.prisma.merchantAgentFee.findMany({
      where: { merchantFeeId: merchant.id },
      include: { agentFee: true },
    });
    console.log({ merchantAgentMany });

    /// Calculate agent fee
    const agentFeeTotal = nominal.mul(
      merchant.percentageForAgent.dividedBy(100),
    );

    const agentFees = merchantAgentMany.map((merchantAgentMany) => {
      return {
        name: merchantAgentMany.agentFee.name,
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
      nominal: nominal.toString(),
      merchantNetAmount: merchantNetAmount.toString(),
      agentFeeTotal: agentFeeTotal.toString(),
      agentFees: agentFees,
      providerFee: providerFee.toString(),
      internalFee: internalFee.toString(),
    };
    console.log(obj);

    return obj;
  }
}
