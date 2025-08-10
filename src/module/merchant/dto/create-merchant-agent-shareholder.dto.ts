import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimal } from 'src/decorator/decimal.decorator';

export class CreateMerchantAgentShareholderDto {
  @ApiProperty()
  agentId: number;

  @ToDecimal()
  @ApiProperty()
  percentagePerAgent: Decimal;
}
