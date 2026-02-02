import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import Decimal from 'decimal.js';
import { ToDecimal, ToDecimalNullable } from 'src/shared/decorator';
import { ActionEnum } from 'src/shared/constant/merchant-fee.constant';

export class UpsertMerchantFeeDto {
  @IsEnum(ActionEnum)
  @ApiProperty({ enum: ActionEnum, example: ActionEnum.U })
  action: ActionEnum;

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
