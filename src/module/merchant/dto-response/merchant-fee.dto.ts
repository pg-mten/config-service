import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
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

  @ApiProperty({ type: Boolean })
  isPercentageInternal: boolean;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeInternal: Decimal;

  @ApiProperty({ type: Boolean })
  isPercentageAgent: boolean;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeAgent: Decimal;
}
