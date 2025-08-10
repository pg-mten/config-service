import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalNullable } from 'src/decorator/decimal.decorator';

export class CreateMerchantAgentFeeDto {
  @ApiProperty()
  internalFeeId: number;

  @ToDecimalNullable()
  @ApiProperty()
  percentageForAgent: Decimal | null;
}
