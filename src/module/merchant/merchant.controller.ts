import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantConfigDto } from './dto/merchant-config.dto';
import { CreateMerchantAgentFeeDto } from './dto/create-merchant-agent-fee.dto';
import { CreateMerchantFeePipe } from './pipe/create-merchant-fee.pipe';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { UpdateMerchantAgentFeeDto } from './dto/update-merchant-agent-fee';
import { CreateMerchantAgentShareholderDto } from './dto/create-merchant-agent-shareholder.dto';
import { UpdateMerchantAgentShareholderDto } from './dto/update-merchant-agent-shareholder.dto';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get(':merchantId/config')
  @ApiOperation({ summary: 'Merchant fee config information' })
  @ApiOkResponse({ type: MerchantConfigDto, isArray: true })
  findAllConfig(@Param('merchantId', ParseIntPipe) merchantId: number) {
    return this.merchantService.findAllConfig(merchantId);
  }

  @Post(':merchantId/provider')
  @ApiOperation({
    summary: 'Create Merchant chosing provider and payment method',
  })
  @ApiBody({ type: CreateMerchantAgentFeeDto, isArray: true })
  async createProvider(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(CreateMerchantFeePipe) body: CreateMerchantAgentFeeDto[],
  ) {
    await this.merchantService.createProvider(merchantId, body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Patch(':merchantId/provider')
  @ApiOperation({
    summary: 'Update Merchant chosing provider and payment method',
  })
  @ApiBody({ type: UpdateMerchantAgentFeeDto, isArray: true })
  async updateProvider(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(CreateMerchantFeePipe) body: UpdateMerchantAgentFeeDto[],
  ) {
    await this.merchantService.updateProvider(merchantId, body);
    return new ResponseDto({ status: ResponseStatus.UPDATED });
  }

  @Post(':merchantId/agent-shareholder')
  @ApiOperation({ summary: 'Create Agent shareholder' })
  @ApiBody({ type: CreateMerchantAgentShareholderDto, isArray: true })
  async createAgentShareholder(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(CreateMerchantFeePipe) body: CreateMerchantAgentShareholderDto[],
  ) {
    await this.merchantService.createAgentShareholder(merchantId, body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post(':merchantId/agent-shareholder')
  @ApiOperation({ summary: 'Create Agent shareholder' })
  @ApiBody({ type: UpdateMerchantAgentShareholderDto, isArray: true })
  async updateAgentShareholder(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(CreateMerchantFeePipe) body: UpdateMerchantAgentShareholderDto[],
  ) {
    await this.merchantService.updateAgentShareholder(merchantId, body);
    return new ResponseDto({ status: ResponseStatus.UPDATED });
  }
}
