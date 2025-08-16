import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { AgentDto } from 'src/module/fee/dto/agent.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class AgentFeeDto {
  constructor(data: AgentFeeDto) {
    DtoHelper.assign(this, data);
  }

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  nominal: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  fee: Decimal;

  @ApiProperty({ type: AgentDto, isArray: true })
  agents: AgentDto[];
}
