import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentService } from './agent.service';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';

@Controller('agent')
@ApiTags('Agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({ summary: 'Create Agent' })
  @ApiBody({ type: CreateAgentDto })
  async create(@Body() body: CreateAgentDto) {
    await this.agentService.create(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }
}
