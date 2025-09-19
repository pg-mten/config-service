import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentSystemDto } from 'src/microservice/config/dto-system/create-agent.system.dto';
import { UserAuthClient } from 'src/microservice/auth/user.auth.client';

@Injectable()
export class AgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userAuthClient: UserAuthClient,
  ) {}

  create(body: CreateAgentSystemDto) {
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

    const res = await this.userAuthClient.findAllMerchantsAndAgentsByIdsTCP({
      merchantIds,
      agentIds: '',
    });

    return res.data?.merchants ?? [];
  }
}
