import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICES } from 'src/shared/constant/client.constant';
import { CustomValidationPipe } from 'src/shared/pipe';
import { CreateAgentSystemDto } from 'src/microservice/config/dto-system/create-agent.system.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { SystemApi } from 'src/microservice/auth/decorator';

@Controller()
@ApiTags('Agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @SystemApi()
  @Post(SERVICES.CONFIG.point.create_agent_config.path)
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Create Agent System' })
  async create(@Body() body: CreateAgentSystemDto) {
    console.log({ body });
    await this.agentService.create(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.point.create_agent_config.cmd })
  async createTCP(
    @Payload(CustomValidationPipe)
    payload: CreateAgentSystemDto,
  ) {
    console.log({ payload });
    await this.agentService.create(payload);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Get('agent/:agentId/merchants')
  @ApiOperation({ summary: 'Merchant List with Agent Shareholder by Agent Id' })
  findMerchantByAgentId(@Param('agentId', ParseIntPipe) agentId: number) {
    console.log({ agentId });
    return this.agentService.findMerchantByAgentId(agentId);
  }
}
