import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';

export class MerchantFeeDto {
  constructor(data: MerchantFeeDto) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  nominal: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  merchantNetAmount: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  percentage: Decimal;
}
