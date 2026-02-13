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
import { UpsertMerchantFeeDto } from './dto-request/upsert-merchant-fee.dto';
import { UpsertMerchantAgentShareholderDto } from './dto-request/upsert-merchant-agent-shareholder.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomValidationPipe } from 'src/shared/pipe';
import { CreateMerchantSystemDto } from 'src/microservice/config/dto-system/create-merchant.system.dto';
import { SERVICES } from 'src/shared/constant/client.constant';
import { SystemApi } from 'src/microservice/auth/decorator';

@Controller()
@ApiTags('Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('merchant/:merchantId/config')
  @ApiOperation({ summary: 'Merchant config information' })
  @ApiOkResponse({ type: MerchantConfigDto, isArray: true })
  findAllConfigByMerchantId(
    @Param('merchantId', ParseIntPipe) merchantId: number,
  ) {
    return this.merchantService.findAllConfigByMerchantId(merchantId);
  }

  @SystemApi()
  @Post(SERVICES.CONFIG.point.create_merchant_config.path)
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Create Merchant System' })
  @ApiBody({ type: CreateMerchantSystemDto })
  async create(@Body() body: CreateMerchantSystemDto) {
    console.log({ body });
    await this.merchantService.create(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.point.create_merchant_config.cmd })
  async createTCP(
    @Payload(CustomValidationPipe)
    body: CreateMerchantSystemDto,
  ) {
    console.log({ body });
    await this.merchantService.create(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post('merchant/:merchantId/provider')
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

  @Post('merchant/:merchantId/agent-shareholder')
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
