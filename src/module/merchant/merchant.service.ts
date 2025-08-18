import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MerchantConfigDto } from './dto/merchant-config.dto';
import { CreateMerchantFeeDto } from './dto/create-merchant-fee.dto';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { UpdateMerchantAgentFeeDto } from './dto/update-merchant-agent-fee';
import { CreateMerchantAgentShareholderDto } from './dto/create-merchant-agent-shareholder.dto';
import { ResponseException } from 'src/exception/response.exception';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { URL_AUTH } from 'src/shared/constant/url.constant';
import { ResponseDto } from 'src/shared/response.dto';
import { MerchantDto } from './dto/merchant.dto';
import { AgentDto } from './dto/agent.dto';
import { MerchantAgentDto } from './dto/merchant-agent.dto';
import { FeeConfigDto } from './dto/fee-config.dto';
import { MerchantFeeConfigDto } from './dto/merchant-fee-config.dto';
import { BaseFeeConfigDto } from './dto/base-fee-config.dto';
import { DateHelper } from 'src/shared/helper/date.helper';
import { AgentShareholderDto } from './dto/agent-shareholder.dto';

@Injectable()
export class MerchantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async findAll() {
    const result = await this.prisma.$queryRawUnsafe<
      {
        merchantId: number;
        agentIds: number[];
      }[]
    >(`
  SELECT
    "merchantId",
    array_agg("agentId") AS "agentIds"
  FROM "config"."AgentShareholder"
  GROUP BY "merchantId"
  ORDER BY "merchantId"
`);

    const agentIds = (
      await this.prisma.agentShareholder.findMany({
        distinct: ['agentId'],
        select: { agentId: true },
      })
    )
      .map((a) => a.agentId)
      .join(',');

    const merchantIds = (
      await this.prisma.agentShareholder.findMany({
        distinct: ['merchantId'],
        select: { merchantId: true },
      })
    )
      .map((a) => a.merchantId)
      .join(',');

    console.log({ agentIds, merchantIds, result });

    const res = await firstValueFrom(
      this.httpService.get<
        ResponseDto<{ merchants: MerchantDto[]; agents: AgentDto[] }>
      >(`${URL_AUTH}/user/internal/merchants-and-agents-by-ids`, {
        params: { merchantIds: merchantIds, agentIds: agentIds },
      }),
    );

    const { merchants, agents } = res.data.data!;

    return result.map((data) => {
      return new MerchantAgentDto({
        merchant: merchants.find((a) => a.merchantId === data.merchantId)!,
        agents: data.agentIds.map((agentId) => {
          return agents.find((a) => a.agentId === agentId)!;
        }),
      });
    });
  }

  findById(merchantId: number) {
    return this.prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
    });
  }

  async findAllConfigByMerchantId(merchantId: number) {
    /**
     * Merchant
     */
    const merchant = await this.prisma.merchant.findUniqueOrThrow({
      where: { id: merchantId },
    });

    /**
     * Agent Shareholder
     */
    const agentShareholders = await this.prisma.agentShareholder.findMany({
      where: { merchantId: merchantId },
    });
    const agentShareholderDtos = agentShareholders.map((agentShareholder) => {
      return new AgentShareholderDto({ ...agentShareholder });
    });

    /**
     * Merchant Fee and Base Fee (config)
     */
    const merchantFees = await this.prisma.merchantFee.findMany({
      where: { merchantId },
      include: { baseFee: true },
    });
    const feeConfigDtos: FeeConfigDto[] = merchantFees.map((merchantFee) => {
      return new FeeConfigDto({
        baseFeeConfig: new BaseFeeConfigDto({ ...merchantFee.baseFee }),
        merchantFeeConfig: new MerchantFeeConfigDto({ ...merchantFee }),
      });
    });
    console.log({ feeConfigDtos });

    return new MerchantConfigDto({
      settlementInternal: merchant.settlementInterval,
      lastSettlementAt: DateHelper.fromJsDate(merchant.lastSettlementAt),
      agentShareholders: agentShareholderDtos,
      fees: feeConfigDtos,
    });
  }

  createProvider(merchantId: number, body: CreateMerchantFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: { id: merchantId },
      });
      console.log({ merchant });
      const merchantFeeManyInput: Prisma.MerchantFeeCreateManyInput[] =
        body.map((data) => {
          return {
            merchantId: merchant.id,
            baseFeeId: data.baseFeeId,
            isPercentageInternal: data.isPercentageInternal,
            feeInternal: data.feeInternal,
            isPercentageAgent: data.isPercentageAgent,
            feeAgent: data.feeAgent ?? new Decimal(0),
          } as Prisma.MerchantFeeCreateManyInput;
        });
      await tx.merchantFee.createManyAndReturn({
        data: merchantFeeManyInput,
      });
    });
  }

  updateProvider(merchantId: number, body: UpdateMerchantAgentFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const merchantFee of body) {
        await tx.merchantFee.update({
          where: {
            merchantId_baseFeeId: {
              merchantId,
              baseFeeId: merchantFee.baseFeeId,
            },
          },
          data: {
            isPercentageInternal: merchantFee.isPercentageInternal,
            feeInternal: merchantFee.feeInternal,
            isPercentageAgent: merchantFee.isPercentageAgent,
            feeAgent: merchantFee.feeAgent ?? new Decimal(0),
          },
        });
      }
    });
  }

  createAgentShareholder(
    merchantId: number,
    body: CreateMerchantAgentShareholderDto[],
  ) {
    this.agentShareholderValidity(body.map((e) => e.percentagePerAgent));
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
    this.agentShareholderValidity(body.map((e) => e.percentagePerAgent));
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
    if (!totalPercentage.eq(new Decimal(100))) {
      throw ResponseException.fromHttpExecption(
        new UnprocessableEntityException(`Sum of fee percentage must be 100%`),
        {
          logic: `Current Sum of fee percentage [${totalPercentage.toFixed(2)}]`,
        },
      );
    }
  }
}
