import { ApiProperty } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { MerchantBaseFeeConfigDto } from './merchant-base-fee-config.dto';
import { AgentShareholderDto } from './agent-shareholder.dto';

export class MerchantConfigDto {
  constructor(data: MerchantConfigDto) {
    Object.assign(this, data);
  }

  @ApiProperty()
  settlementInterval: number;

  @ApiProperty({ required: false })
  lastSettlementAt: DateTime | null;

  @ApiProperty({ type: AgentShareholderDto, isArray: true, required: false })
  agentShareholders: AgentShareholderDto[] | null;

  @ApiProperty({ type: MerchantBaseFeeConfigDto, isArray: true })
  fees: MerchantBaseFeeConfigDto[];
}
