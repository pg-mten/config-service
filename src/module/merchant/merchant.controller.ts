import { Controller, Get } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('my-fee-config')
  findMyConfig() {
    return this.merchantService.findMyFeeConfig();
  }
}
