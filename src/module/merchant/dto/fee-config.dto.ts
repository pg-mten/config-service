import { ApiProperty } from '@nestjs/swagger';
import { BaseFeeConfigDto } from './base-fee-config.dto';
import { MerchantFeeConfigDto } from './merchant-fee-config.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class FeeConfigDto {
  constructor(data: FeeConfigDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: BaseFeeConfigDto })
  baseFeeConfig: BaseFeeConfigDto;

  @ApiProperty({ type: MerchantFeeConfigDto })
  merchantFeeConfig: MerchantFeeConfigDto;
}
