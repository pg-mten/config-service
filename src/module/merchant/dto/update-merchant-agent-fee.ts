import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalNullable } from 'src/decorator/decimal.decorator';

export class UpdateMerchantAgentFeeDto {
  @ApiProperty()
  internalFeeId: number;

  @ToDecimalNullable()
  @ApiProperty({ type: Decimal, required: false })
  percentageForAgent: Decimal | null;
}
