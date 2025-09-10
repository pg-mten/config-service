import { Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { ResponseDto } from 'src/shared/response.dto';
import { AgentDto } from '../merchant/dto-response/agent.dto';
import { MerchantDto } from '../merchant/dto-response/merchant.dto';
import { URL_AUTH } from 'src/shared/constant/url.constant';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  create(body: CreateAgentDto) {
    const { id } = body;
    return this.prisma.agent.create({
      data: { id },
    });
  }

  async findMerchantByAgentId(agentId: number) {
    const merchantIds = (
      await this.prisma.agentShareholder.findMany({
        where: { agentId },
        select: { merchantId: true },
      })
    )
      .map((a) => a.merchantId)
      .join(',');
    console.log({ merchantIds });

    const res = await firstValueFrom(
      this.httpService.get<
        ResponseDto<{ merchants: MerchantDto[]; agents: AgentDto[] }>
      >(`${URL_AUTH}/user/internal/merchants-and-agents-by-ids`, {
        params: { merchantIds: merchantIds, agentIds: '' },
      }),
    );

    const { merchants } = res.data.data!;
    return merchants;
  }
}
