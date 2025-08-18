import { Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentService {
  constructor(private readonly prisma: PrismaService) {}

  create(body: CreateAgentDto) {
    const { id } = body;
    return this.prisma.agent.create({
      data: { id },
    });
  }
}
