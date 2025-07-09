import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryPurchasingFeeDto } from './dto/query-purchasing-fee.dto';
import { AgentDto } from '../agent/dto/agent.dto';
import Decimal from 'decimal.js';
import { AgentFeeDto } from './dto/agent-fee.dto';
import { InternalFeeDto } from './dto/internal-fee.dto';
import { ProviderFeeDto } from './dto/provider-fee.dto';
import { MerchantFeeDto } from './dto/merchant-fee.dto';
import { PurchasingFeeDto } from './dto/purchashing-fee.dto';

@Injectable()
export class FeeService {
  constructor(private readonly prisma: PrismaService) {}

  async calculatePuchasingFee(query: QueryPurchasingFeeDto) {
    const { merchantId, providerName, paymentMethodName, nominal } = query;

    /**
     * Provider Fee
     */
    // Find provider fee
    const providerFee = await this.prisma.providerFee.findUniqueOrThrow({
      where: {
        providerName_paymentMethodName: {
          providerName: providerName,
          paymentMethodName: paymentMethodName,
        },
      },
    });
    // Calculate provider fee
    const providerFeeTotal = nominal.mul(
      providerFee.percentageProvider.dividedBy(100),
    );

    /**
     * Internal Fee
     */
    // Find internal fee
    const internalFee = await this.prisma.internalFee.findUniqueOrThrow({
      where: {
        providerFeeId: providerFee.id,
      },
    });
    // Calculate internal fee
    const internalFeeTotal = nominal.mul(
      internalFee.percentageInternal.dividedBy(100),
    );

    /**
     * Agent Fee
     */
    // Find agent fee
    const agentFee = await this.prisma.agentFee.findUniqueOrThrow({
      where: {
        merchantId_internalFeeId: {
          merchantId: merchantId,
          internalFeeId: internalFee.id,
        },
      },
    });
    // Calculate Total
    const agentFeeTotal = nominal.mul(
      agentFee.percentageForAgent.dividedBy(100),
    );
    // Find agent shareholders
    const shareholders = await this.prisma.merchantAgentShareholder.findMany({
      where: {
        merchantId: merchantId,
      },
      include: { agent: true },
    });

    // Calculate per Agent
    const agentDtos = shareholders.map((shareholder) => {
      return new AgentDto({
        id: shareholder.agent.id,
        name: shareholder.agent.name,
        nominal: agentFeeTotal.mul(
          shareholder.percentagePerAgent.dividedBy(100),
        ),
        percentage: shareholder.percentagePerAgent,
      });
    });

    /**
     * Merchant Fee
     */
    const merchant = await this.prisma.merchant.findUniqueOrThrow({
      where: { id: merchantId },
    });
    // Calculate merchant net amount
    const merchantNetAmount = nominal
      .sub(providerFeeTotal)
      .sub(internalFeeTotal)
      .sub(agentFeeTotal);

    // Calculate merchant percentage
    const merchantPercentage = new Decimal(100)
      .sub(providerFee.percentageProvider)
      .sub(internalFee.percentageInternal)
      .sub(agentFee.percentageForAgent);

    /**
     * DTO
     */
    const providerFeeDto = new ProviderFeeDto({
      id: providerFee.id,
      name: providerFee.providerName,
      nominal: providerFeeTotal,
      percentage: providerFee.percentageProvider,
    });
    const internalFeeDto = new InternalFeeDto({
      id: internalFee.id,
      nominal: internalFeeTotal,
      percentage: internalFee.percentageInternal,
    });
    const agentFeeDto = new AgentFeeDto({
      nominal: agentFeeTotal,
      percentage: agentFee.percentageForAgent,
      agents: agentDtos,
    });
    const merchantFeeDto = new MerchantFeeDto({
      id: merchantId,
      merchantNetAmount: merchantNetAmount,
      name: merchant.name,
      nominal: nominal,
      percentage: merchantPercentage,
    });

    return new PurchasingFeeDto({
      provider: providerFeeDto,
      internal: internalFeeDto,
      agent: agentFeeDto,
      merchant: merchantFeeDto,
    });
  }
}
