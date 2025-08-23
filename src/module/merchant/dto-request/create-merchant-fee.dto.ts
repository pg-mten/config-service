import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimal, ToDecimalNullable } from 'src/decorator/decimal.decorator';

export class CreateMerchantFeeDto {
  @ApiProperty({ type: Number })
  baseFeeId: number;

  @ApiProperty({ type: Boolean })
  isPercentageInternal: boolean;

  @ToDecimal()
  @ApiProperty({ type: Decimal })
  feeInternal: Decimal;

  @ApiProperty({ type: Boolean })
  isPercentageAgent: boolean;

  @ToDecimalNullable()
  @ApiProperty({ type: Decimal, required: false })
  feeAgent: Decimal | null;
}
