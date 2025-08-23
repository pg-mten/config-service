import { ApiProperty } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { MerchantBaseFeeConfigDto } from './merchant-base-fee-config.dto';
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

  @ApiProperty({ type: MerchantBaseFeeConfigDto, isArray: true })
  fees: MerchantBaseFeeConfigDto[];
}
