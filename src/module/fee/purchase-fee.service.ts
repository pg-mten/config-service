import { TransactionTypeEnum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilterPurchasingFeeDto } from './dto/filter-purchasing-fee.dto';
import Decimal from 'decimal.js';
import { AgentFeeEachDto } from './dto/agent-fee-each.dto';
import { ProviderFeeDto } from './dto/provider-fee.dto';
import { InternalFeeDto } from './dto/internal-fee.dto';
import { AgentFeeDto } from './dto/agent-fee.dto';
import { MerchantFeeDto } from './dto/merchant-fee.dto';
import { PurchasingFeeDto } from './dto/purchashing-fee.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PurchaseFeeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly transactionType = TransactionTypeEnum.PURCHASE;

  async calculatePurchaseFee(filter: FilterPurchasingFeeDto) {
    const { merchantId, providerName, paymentMethodName, nominal } = filter;

    /**
     * Find Base Fee
     */
    const baseFee = await this.prisma.baseFee.findFirstOrThrow({
      where: {
        providerName,
        paymentMethodName,
        transactionType: this.transactionType,
      },
    });
    console.log({ baseFee });

    /**
     * Provider Fee Calculate
     */
    let feeProviderTotal = new Decimal(0);
    if (baseFee.isPercentageProvider) {
      feeProviderTotal = nominal.times(baseFee.feeProvider.dividedBy(100));
    } else {
      feeProviderTotal = baseFee.feeProvider;
    }
    console.log({ feeProviderTotal });

    /**
     * Find Merchant Fee
     */
    const merchantFee = await this.prisma.merchantFee.findUniqueOrThrow({
      where: {
        merchantId_baseFeeId: {
          merchantId,
          baseFeeId: baseFee.id,
        },
      },
    });
    console.log({ merchantFee });

    /**
     * Internal Fee Calculate
     */
    let feeInternalTotal = new Decimal(0);
    if (merchantFee.isPercentageInternal) {
      feeInternalTotal = nominal.times(merchantFee.feeInternal.dividedBy(100));
    } else {
      feeInternalTotal = merchantFee.feeInternal;
    }
    console.log({ feeInternalTotal });

    /**
     * Agent Related to Merchant
     * If fee agent equals to zero then it means merchant do not have an agent
     */
    const isMerchantHaveAgents = !merchantFee.feeAgent.equals(new Decimal(0));
    console.log({ isMerchantHaveAgents });

    /**
     * Agent Fee Total Calculate
     */
    let feeAgentTotal = new Decimal(0);
    if (isMerchantHaveAgents) {
      if (merchantFee.isPercentageAgent) {
        feeAgentTotal = nominal.times(merchantFee.feeAgent.dividedBy(100));
      } else {
        feeAgentTotal = merchantFee.feeAgent;
      }
    }
    console.log({ feeAgentTotal });

    /**
     * Find Agent Shareholder based on Merchant and Calculate Nominal each Agent
     */
    const agentDtos: AgentFeeEachDto[] = [];
    if (isMerchantHaveAgents) {
      const shareholders = await this.prisma.agentShareholder.findMany({
        where: { merchantId },
        include: { agent: true },
      });
      agentDtos.push(
        ...shareholders.map((shareholder) => {
          return new AgentFeeEachDto({
            id: shareholder.agent.id,
            nominal: feeAgentTotal.times(
              shareholder.percentagePerAgent.dividedBy(100),
            ),
            feePercentage: shareholder.percentagePerAgent,
          });
        }),
      );
    }

    /**
     * Merchant Fee Calculate
     */
    // Calculate merchant net amount
    const merchantNetAmount = nominal
      .minus(feeProviderTotal)
      .minus(feeInternalTotal)
      .minus(feeAgentTotal);

    // Calculate merchant percentage
    const merchantPercentage = merchantNetAmount.dividedBy(nominal).times(100);

    console.log({ merchantNetAmount, merchantPercentage });

    /**
     * DTO
     */
    const providerFeeDto = new ProviderFeeDto({
      name: providerName,
      nominal: feeProviderTotal,
      isPercentage: baseFee.isPercentageProvider,
      fee: baseFee.feeProvider,
    });
    const internalFeeDto = new InternalFeeDto({
      nominal: feeInternalTotal,
      isPercentage: merchantFee.isPercentageInternal,
      fee: merchantFee.feeInternal,
    });
    const agentFeeDto = new AgentFeeDto({
      nominal: feeAgentTotal,
      isPercentage: merchantFee.isPercentageAgent,
      fee: merchantFee.feeAgent,
      agents: agentDtos,
    });
    const merchantFeeDto = new MerchantFeeDto({
      id: merchantId,
      netNominal: merchantNetAmount,
      nominal: nominal,
      feePercentage: merchantPercentage,
    });

    return new PurchasingFeeDto({
      providerFee: providerFeeDto,
      internalFee: internalFeeDto,
      agentFee: agentFeeDto,
      merchantFee: merchantFeeDto,
    });
  }
}
