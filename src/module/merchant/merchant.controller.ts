import { Controller, Get, Query } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { QueryMerchantConfigDto } from './dto/query-merchant-config.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantConfigDto } from './dto/merchant-config.dto';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('config')
  @ApiOperation({ summary: 'Merchant fee config information' })
  @ApiOkResponse({ type: MerchantConfigDto, isArray: true })
  findAllConfig(@Query() query: QueryMerchantConfigDto) {
    return this.merchantService.findAllConfig(query);
  }
}
