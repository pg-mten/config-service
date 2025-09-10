import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MerchantConfigDto } from './dto-response/merchant-config.dto';
import { Decimal } from 'decimal.js';
import { ResponseException } from 'src/exception/response.exception';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { URL_AUTH } from 'src/shared/constant/url.constant';
import { ResponseDto } from 'src/shared/response.dto';
import { MerchantDto } from './dto-response/merchant.dto';
import { AgentDto } from './dto-response/agent.dto';
import { MerchantAgentDto } from './dto-response/merchant-agent.dto';
import { MerchantBaseFeeConfigDto } from './dto-response/merchant-base-fee-config.dto';
import { MerchantFeeDto } from './dto-response/merchant-fee.dto';
import { BaseFeeDto } from './dto-response/base-fee.dto';
import { DateHelper } from 'src/shared/helper/date.helper';
import { AgentShareholderDto } from './dto-response/agent-shareholder.dto';
import { CreateMerchantSystemDto } from './dto-request/create-merchant.system.dto';
import { UpsertMerchantFeeDto } from './dto-request/upsert-merchant-fee.dto';
import { UpsertMerchantAgentShareholderDto } from './dto-request/upsert-merchant-agent-shareholder.dto';
import { ActionEnum } from 'src/shared/constant/merchant-fee.constant';

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

  findByIdThrow(merchantId: number) {
    return this.prisma.merchant.findUniqueOrThrow({
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
    console.log({ agentShareholderDtos });

    /**
     * Merchant Fee and Base Fee (config)
     */
    const baseFees = await this.prisma.baseFee.findMany({
      where: {
        isActive: true,
      },
      orderBy: { code: 'asc' },
      include: {
        merchantFees: {
          where: {
            merchantId, // filter to only this merchant
          },
          take: 1, // each merchantId+baseFeeId is unique
        },
      },
    });
    /// SQL Equivalent
    // SELECT
    //   bf.*,
    //   mf.*
    // FROM config."BaseFee" bf
    // LEFT JOIN config."MerchantFee" mf
    //   ON mf."baseFeeId" = bf.id
    //   AND mf."merchantId" = 3
    // ORDER BY bf.code ASC
    // ; -- replace with the merchantId you want

    const merchantBaseFeeConfigDtos: MerchantBaseFeeConfigDto[] = baseFees
      .map((baseFee) => {
        return new MerchantBaseFeeConfigDto({
          baseFeeConfig: new BaseFeeDto({ ...baseFee }),
          merchantFeeConfig: !baseFee.merchantFees[0]
            ? null
            : new MerchantFeeDto({ ...baseFee.merchantFees[0] }),
        });
      })
      .sort((a, b) => {
        if (a.merchantFeeConfig === null && b.merchantFeeConfig === null)
          return 0;
        if (a.merchantFeeConfig === null) return 1;
        if (b.merchantFeeConfig === null) return -1;
        return a.baseFeeConfig.code.localeCompare(b.baseFeeConfig.code);
      });

    return new MerchantConfigDto({
      settlementInternal: merchant.settlementInterval,
      lastSettlementAt: DateHelper.fromJsDate(merchant.lastSettlementAt),
      agentShareholders:
        agentShareholderDtos.length === 0 ? null : agentShareholderDtos,
      fees: merchantBaseFeeConfigDtos,
    });
  }

  create(body: CreateMerchantSystemDto) {
    const { id, settlementInterval } = body;
    return this.prisma.merchant.create({
      data: {
        id,
        settlementInterval,
      },
    });
  }

  upsertProvider(merchantId: number, body: UpsertMerchantFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      await Promise.all(
        body.map((merchantFee) => {
          const {
            action,
            baseFeeId,
            feeInternalFixed,
            feeInternalPercentage,
            feeAgentFixed,
            feeAgentPercentage,
          } = merchantFee;
          if (action === ActionEnum.D) {
            return tx.merchantFee.delete({
              where: {
                merchantId_baseFeeId: {
                  baseFeeId,
                  merchantId,
                },
              },
            });
          }
          return tx.merchantFee.upsert({
            create: {
              merchantId: merchantId,
              baseFeeId,
              feeInternalFixed,
              feeInternalPercentage,
              feeAgentFixed: feeAgentFixed ?? new Decimal(0),
              feeAgentPercentage: feeAgentPercentage ?? new Decimal(0),
            },
            where: {
              merchantId_baseFeeId: {
                baseFeeId,
                merchantId,
              },
            },
            update: {
              feeInternalFixed,
              feeInternalPercentage,
              feeAgentFixed: feeAgentFixed ?? new Decimal(0),
              feeAgentPercentage: feeAgentPercentage ?? new Decimal(0),
            },
          });
        }),
      );
    });
  }

  upsertAgentShareholder(
    merchantId: number,
    body: UpsertMerchantAgentShareholderDto[],
  ) {
    this.agentShareholderValidity(
      body
        .filter((e) => e.action !== ActionEnum.D)
        .map((e) => e.percentagePerAgent),
    );
    return this.prisma.$transaction(async (tx) => {
      await Promise.all(
        body.map((agentShareholder) => {
          const { action, agentId, percentagePerAgent } = agentShareholder;
          if (action === ActionEnum.D) {
            return tx.agentShareholder.delete({
              where: {
                agentId_merchantId: {
                  agentId,
                  merchantId,
                },
              },
            });
          }
          return tx.agentShareholder.upsert({
            create: {
              merchantId,
              agentId,
              percentagePerAgent,
            },
            where: {
              agentId_merchantId: {
                agentId,
                merchantId,
              },
            },
            update: {
              percentagePerAgent,
            },
          });
        }),
      );
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
