import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class AgentShareholderDto {
  constructor(data: AgentShareholderDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: Number })
  agentId: number;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  percentagePerAgent: Decimal;
}
