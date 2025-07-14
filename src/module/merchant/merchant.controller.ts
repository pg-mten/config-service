import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantConfigDto } from './dto/merchant-config.dto';
import { CreateMerchantFeeDto } from './dto/create-merchant-fee.dto';
import { CreateMerchantFeePipe } from './pipe/create-merchant-fee.pipe';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('config/:merchantId')
  @ApiOperation({ summary: 'Merchant fee config information' })
  @ApiOkResponse({ type: MerchantConfigDto, isArray: true })
  findAllConfig(@Param('merchantId', ParseIntPipe) merchantId: number) {
    return this.merchantService.findAllConfig(merchantId);
  }

  @Post(':merchantId')
  @ApiOperation({ summary: 'Merchant chosing provider and payment method' })
  @ApiBody({ type: CreateMerchantFeeDto, isArray: true })
  create(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(CreateMerchantFeePipe) body: CreateMerchantFeeDto[],
  ) {
    return this.merchantService.create(merchantId, body);
  }
}
