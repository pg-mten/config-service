import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantConfigDto } from './dto-response/merchant-config.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { MerchantAgentDto } from './dto-response/merchant-agent.dto';
import { CreateMerchantSystemDto } from './dto-request/create-merchant.system.dto';
import { UpsertMerchantFeeDto } from './dto-request/upsert-merchant-fee.dto';
import { UpsertMerchantAgentShareholderDto } from './dto-request/upsert-merchant-agent-shareholder.dto';

@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  @ApiOperation({ summary: 'Merchant List with Agent Shareholder' })
  @ApiOkResponse({ type: MerchantAgentDto, isArray: true })
  findAll() {
    return this.merchantService.findAll();
  }

  @Get(':merchantId/config')
  @ApiOperation({ summary: 'Merchant config information' })
  @ApiOkResponse({ type: MerchantConfigDto, isArray: true })
  findAllConfigByMerchantId(
    @Param('merchantId', ParseIntPipe) merchantId: number,
  ) {
    return this.merchantService.findAllConfigByMerchantId(merchantId);
  }

  @Post('/internal')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Create Merchant System Internal' })
  @ApiBody({ type: CreateMerchantSystemDto })
  async create(@Body() body: CreateMerchantSystemDto) {
    console.log({ body });
    await this.merchantService.create(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post(':merchantId/provider')
  @ApiOperation({
    summary: 'Upsert Merchant Fee Configuration',
  })
  @ApiBody({ type: UpsertMerchantFeeDto, isArray: true })
  async upsertProvider(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(new ParseArrayPipe({ items: UpsertMerchantFeeDto }))
    body: UpsertMerchantFeeDto[],
  ) {
    console.log({ merchantId, body });
    await this.merchantService.upsertProvider(merchantId, body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post(':merchantId/agent-shareholder')
  @ApiOperation({ summary: 'Upsert Agent Shareholder Configuration' })
  @ApiBody({ type: UpsertMerchantAgentShareholderDto, isArray: true })
  async upsertAgentShareholder(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(new ParseArrayPipe({ items: UpsertMerchantAgentShareholderDto }))
    body: UpsertMerchantAgentShareholderDto[],
  ) {
    console.log({ merchantId, body });
    await this.merchantService.upsertAgentShareholder(merchantId, body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }
}
