import { TransactionTypeEnum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilterPurchaseFeeSystemDto } from './dto-transaction-system/filter-purchase-fee.system.dto';
import Decimal from 'decimal.js';
import { AgentFeeEachSystemDto } from './dto-system/agent-fee-each.system.dto';
import { ProviderFeeSystemDto } from './dto-system/provider-fee.system.dto';
import { InternalFeeSystemDto } from './dto-system/internal-fee.system.dto';
import { AgentFeeSystemDto } from './dto-system/agent-fee.system.dto';
import { MerchantFeeSystemDto } from './dto-system/merchant-fee.system.dto';
import { Injectable } from '@nestjs/common';
import { DisbursementFeeSystemDto } from './dto-transaction-system/disbursement-fee.system.dto';

@Injectable()
export class DisbursementFeeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly transactionType = TransactionTypeEnum.PURCHASE;

  async calculateDisbursementFee(filter: FilterPurchaseFeeSystemDto) {
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
    const feeProviderTotal = new Decimal(0)
      .plus(baseFee.feeProviderFixed)
      .plus(nominal.times(baseFee.feeProviderPercentage.dividedBy(100)));
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
    const feeInternalTotal = new Decimal(0)
      .plus(merchantFee.feeInternalFixed)
      .plus(nominal.times(merchantFee.feeInternalPercentage.dividedBy(100)));

    console.log({ feeInternalTotal });

    /**
     * Agent Related to Merchant
     * If fee agent equals to zero then it means merchant do not have an agent
     */
    const isMerchantHaveAgents =
      !merchantFee.feeAgentFixed.equals(new Decimal(0)) &&
      !merchantFee.feeAgentPercentage.equals(new Decimal(0));
    console.log({ isMerchantHaveAgents });

    /**
     * Agent Fee Total Calculate
     */
    const feeAgentTotal = new Decimal(0)
      .plus(merchantFee.feeAgentFixed)
      .plus(nominal.times(merchantFee.feeAgentPercentage.dividedBy(100)));
    console.log({ feeAgentTotal });

    /**
     * Find Agent Shareholder based on Merchant and Calculate Nominal each Agent
     */
    const agentDtos: AgentFeeEachSystemDto[] = [];
    if (isMerchantHaveAgents) {
      const shareholders = await this.prisma.agentShareholder.findMany({
        where: { merchantId },
        include: { agent: true },
      });
      agentDtos.push(
        ...shareholders.map((shareholder) => {
          return new AgentFeeEachSystemDto({
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
    const providerFeeDto = new ProviderFeeSystemDto({
      name: providerName,
      nominal: feeProviderTotal,
      feeFixed: baseFee.feeProviderFixed,
      feePercentage: baseFee.feeProviderPercentage,
    });
    const internalFeeDto = new InternalFeeSystemDto({
      nominal: feeInternalTotal,
      feeFixed: merchantFee.feeInternalFixed,
      feePercentage: merchantFee.feeInternalPercentage,
    });
    const agentFeeDto = new AgentFeeSystemDto({
      nominal: feeAgentTotal,
      feeFixed: merchantFee.feeAgentFixed,
      feePercentage: merchantFee.feeAgentPercentage,
      agents: agentDtos,
    });
    const merchantFeeDto = new MerchantFeeSystemDto({
      id: merchantId,
      netNominal: merchantNetAmount,
      nominal: nominal,
      feePercentage: merchantPercentage,
    });

    return new DisbursementFeeSystemDto({
      providerFee: providerFeeDto,
      internalFee: internalFeeDto,
      agentFee: agentFeeDto,
      merchantFee: merchantFeeDto,
    });
  }
}
