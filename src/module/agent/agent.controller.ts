import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentService } from './agent.service';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';

@Controller('agent')
@ApiTags('Agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({ summary: 'Create Agent' })
  async create(@Body() body: CreateAgentDto) {
    console.log({ body });
    await this.agentService.create(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Get(':agentId/merchants')
  @ApiOperation({ summary: 'Merchant List with Agent Shareholder by Agent Id' })
  findMerchantByAgentId(@Param('agentId', ParseIntPipe) agentId: number) {
    console.log({ agentId });
    return this.agentService.findMerchantByAgentId(agentId);
  }
}
