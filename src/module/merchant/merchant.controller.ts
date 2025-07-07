import { Controller, Get } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchasingFeeDto } from '../fee/dto/purchashing-fee.dto';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('my-fee-config')
  @ApiResponse({ type: PurchasingFeeDto })
  findMyConfig() {
    return this.merchantService.findMyFeeConfig();
  }
}
