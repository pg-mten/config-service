import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';

export class FeeConfigDto {
  constructor(data: FeeConfigDto) {
    Object.assign(this, data);
  }

  @ApiProperty()
  internalFeeId: number;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  internalPercentage: Decimal;

  @ApiProperty()
  providerName: string;

  @ApiProperty()
  paymentMethodName: string;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  providerPercentage: Decimal;
}
