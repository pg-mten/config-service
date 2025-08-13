import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimal } from 'src/decorator/decimal.decorator';

export class UpdateMerchantAgentShareholderDto {
  @ApiProperty()
  agentId: number;

  @ToDecimal()
  @ApiProperty({ type: Decimal })
  percentagePerAgent: Decimal;
}
