import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { AgentDto } from 'src/module/agent/dto/agent.dto';

export class AgentFeeDto {
  constructor(data: AgentFeeDto) {
    Object.assign(this, data);
  }

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  nominal: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  percentage: Decimal;

  @ApiProperty({ type: AgentDto, isArray: true })
  agents: AgentDto[];
}
