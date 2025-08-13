import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateIf } from 'class-validator';
import Decimal from 'decimal.js';
import { ToDecimal } from 'src/decorator/decimal.decorator';
import { PaymentMethodExist } from 'src/module/common/validator/payment-method-exist.validator';
import { ProviderExist } from 'src/module/common/validator/provider-exist.validator';

export class QueryPurchasingFeeDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  merchantId: number;

  @ProviderExist()
  @IsString()
  @ApiProperty({ example: 'NETZME' })
  providerName: string;

  @PaymentMethodExist()
  @IsString()
  @ApiProperty({ example: 'QRIS' })
  paymentMethodName: string;

  @ToDecimal()
  @Type(() => Decimal)
  @ValidateIf((o) => o.nominal !== undefined)
  @ApiProperty({ type: Decimal, example: '100' })
  nominal: Decimal;
}
