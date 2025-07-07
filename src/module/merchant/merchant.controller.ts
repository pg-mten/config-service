import { Controller, Get } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MerchantFeeDto } from './dto/merchant-fee.dto';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('my-fee-config')
  @ApiResponse({ type: MerchantFeeDto })
  findMyConfig() {
    return this.merchantService.findMyFeeConfig();
  }
}
