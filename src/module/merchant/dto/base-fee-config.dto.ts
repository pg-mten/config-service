import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class BaseFeeConfigDto {
  constructor(data: BaseFeeConfigDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  providerName: string;

  @ApiProperty({ type: String })
  paymentMethodName: string;

  @ApiProperty({ type: String })
  transactionTypeName: string;

  @ApiProperty({ type: Boolean })
  isPercentageProvider: boolean;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeProvider: Decimal;
}
