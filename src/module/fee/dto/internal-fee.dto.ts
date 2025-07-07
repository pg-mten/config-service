import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';

export class InternalFeeDto {
  constructor(data: InternalFeeDto) {
    Object.assign(this, data);
  }
  @ApiProperty()
  id: number;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  nominal: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  percentage: Decimal;
}
