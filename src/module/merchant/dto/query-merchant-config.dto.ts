import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { MerchantExist } from '../validator/merchant-exist.validator';

export class QueryMerchantConfigDto {
  @MerchantExist()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 1 })
  merchantId: number;
}
