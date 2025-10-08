import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { AgentFeeEachSystemDto } from 'src/module/fee/dto-system/agent-fee-each.system.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class AgentFeeSystemDto {
  constructor(data: AgentFeeSystemDto) {
    DtoHelper.assign(this, data);
  }

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  nominal: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeFixed: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feePercentage: Decimal;

  @ApiProperty({ type: AgentFeeEachSystemDto, isArray: true })
  agents: AgentFeeEachSystemDto[];
}
