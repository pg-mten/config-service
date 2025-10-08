import { ApiProperty } from '@nestjs/swagger';
// import { TransactionStatusEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import Decimal from 'decimal.js';
import { ToDecimal } from 'src/decorator/decimal.decorator';

export class CreatePurchaseCallbackSystemDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  externalId: string | null;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  referenceId: string | null;

  @IsString()
  @ApiProperty()
  code: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  merchantId: number;

  @IsString()
  @ApiProperty()
  providerName: string;

  @IsString()
  @ApiProperty()
  paymentMethodName: string;

  // @IsEnum(TransactionStatusEnum)
  // @ApiProperty()
  // status: TransactionStatusEnum;

  @ToDecimal()
  @Type(() => Decimal)
  @ValidateIf((o) => o.nominal !== undefined)
  @ApiProperty()
  nominal: Decimal;

  @IsOptional()
  @ApiProperty()
  metadata: Record<string, unknown> | null;
}
