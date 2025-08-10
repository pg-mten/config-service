import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MerchantConfigDto } from './dto/merchant-config.dto';
import { CreateMerchantAgentFeeDto } from './dto/create-merchant-agent-fee.dto';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateMerchantAgentFeeDto } from './dto/update-merchant-agent-fee';
import { CreateMerchantAgentShareholderDto } from './dto/create-merchant-agent-shareholder.dto';
import { ResponseException } from 'src/exception/response.exception';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { URL_AUTH } from 'src/shared/constant/webclient';
import { ResponseDto } from 'src/shared/response.dto';
import { MerchantDto } from './dto/merchant.dto';
import { AgentDto } from './dto/agent.dto';
import { MerchantAgentDto } from './dto/merchant-agent.dto';

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
          agentPercentage: agentFee.percentageForAgent ?? new Decimal(0),
        }),
      );
    }
    providers.sort((a, b) => a.provider.localeCompare(b.provider));
    return providers;
  }

  createProvider(merchantId: number, body: CreateMerchantAgentFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.agentFee.createManyAndReturn({
        data: body.map((data) => {
          return {
            internalFeeId: data.internalFeeId,
            merchantId: merchantId,
            percentageForAgent: data.percentageForAgent,
          } as Prisma.AgentFeeCreateManyInput;
        }),
      });
    });
  }

  updateProvider(merchantId: number, body: UpdateMerchantAgentFeeDto[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const agentFee of body) {
        await tx.agentFee.update({
          where: {
            merchantId_internalFeeId: {
              merchantId: merchantId,
              internalFeeId: agentFee.internalFeeId,
            },
          },
          data: { percentageForAgent: agentFee.percentageForAgent },
        });
      }
    });
  }

  createAgentShareholder(
    merchantId: number,
    body: CreateMerchantAgentShareholderDto[],
  ) {
    this.agentShareholderValidity(
      body.map((e) => e.percentagePerAgent as Decimal),
    );
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
    this.agentShareholderValidity(
      body.map((e) => e.percentagePerAgent as Decimal),
    );
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

    if (totalPercentage.equals(new Decimal(100))) {
      throw ResponseException.fromHttpExecption(
        new UnprocessableEntityException(`Sum of fee percentage must be 100%`),
        {
          logic: `Current Sum of fee percentage [${totalPercentage.toFixed(2)}]`,
        },
      );
    }
  }
}
