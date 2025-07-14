import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';

export class MerchantConfigDto {
  constructor(data: MerchantConfigDto) {
    Object.assign(this, data);
  }

  @ApiProperty()
  internalFeeId: number;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  internalPercentage: Decimal;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  paymentMethod: string;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  providerPercentage: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  agentPercentage: Decimal;
}
