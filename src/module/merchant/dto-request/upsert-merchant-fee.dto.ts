import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimal, ToDecimalNullable } from 'src/decorator/decimal.decorator';

export class UpsertMerchantFeeDto {
  @ApiProperty({ type: Number })
  baseFeeId: number;

  @ToDecimal()
  @ApiProperty({ type: Decimal })
  feeInternalFixed: Decimal;

  @ToDecimal()
  @ApiProperty({ type: Decimal })
  feeInternalPercentage: Decimal;

  @ToDecimalNullable()
  @ApiProperty({ type: Decimal, required: false })
  feeAgentFixed: Decimal | null;

  @ToDecimalNullable()
  @ApiProperty({ type: Decimal, required: false })
  feeAgentPercentage: Decimal | null;
}
