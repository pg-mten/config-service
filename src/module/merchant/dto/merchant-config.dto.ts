import { ApiProperty } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { FeeConfigDto } from './fee-config.dto';
import { AgentShareholderDto } from './agent-shareholder.dto';

export class MerchantConfigDto {
  constructor(data: MerchantConfigDto) {
    Object.assign(this, data);
  }

  @ApiProperty()
  settlementInternal: number;

  @ApiProperty()
  lastSettlementAt: DateTime | null;

  @ApiProperty({ type: AgentShareholderDto, isArray: true })
  agentShareholders: AgentShareholderDto[];

  @ApiProperty({ type: FeeConfigDto, isArray: true })
  fees: FeeConfigDto[];
}
