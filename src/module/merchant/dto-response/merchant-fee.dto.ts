import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class MerchantFeeDto {
  constructor(data: MerchantFeeDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  baseFeeId: number;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeInternalFixed: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeInternalPercentage: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeAgentFixed: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeAgentPercentage: Decimal;
}
