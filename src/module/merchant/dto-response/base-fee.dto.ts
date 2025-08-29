import { ApiProperty } from '@nestjs/swagger';
import { TransactionTypeEnum } from '@prisma/client';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class BaseFeeDto {
  constructor(data: BaseFeeDto) {
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

  @ApiProperty({ enum: TransactionTypeEnum })
  transactionType: TransactionTypeEnum;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeProviderFixed: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  feeProviderPercentage: Decimal;
}
