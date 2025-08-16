import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class BaseFeeDto {
  constructor(data: BaseFeeDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  providerName: string;

  @ApiProperty()
  paymentMethodName: string;

  @ApiProperty()
  transactionTypeName: string;

  @ApiProperty()
  isPercentageProvider: boolean;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeProvider: Decimal;
}
