import { ApiProperty } from '@nestjs/swagger';
import { BaseFeeDto } from './base-fee.dto';
import { MerchantFeeDto } from './merchant-fee.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class MerchantBaseFeeConfigDto {
  constructor(data: MerchantBaseFeeConfigDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: BaseFeeDto })
  baseFeeConfig: BaseFeeDto;

  @ApiProperty({ type: MerchantFeeDto, required: false })
  merchantFeeConfig: MerchantFeeDto | null;
}
