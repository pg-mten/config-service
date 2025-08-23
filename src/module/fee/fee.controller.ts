import { Controller, Get, Query } from '@nestjs/common';
import { FeeService } from './fee.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchasingFeeDto } from './dto/purchashing-fee.dto';
import { FilterPurchasingFeeDto } from './dto/filter-purchasing-fee.dto';
import { BaseFeeDto } from './dto/base-fee.dto';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';
import { FilterWithdrawFeeDto } from './dto/filter-withdraw-fee.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('fee')
export class FeeController {
  constructor(
    private readonly feeService: FeeService,
    private readonly purchaseFeeService: PurchaseFeeService,
    private readonly withdrawFeeService: WithdrawFeeService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'List All Provider fee configuration' })
  @ApiOkResponse({ type: BaseFeeDto, isArray: true })
  async config() {
    return this.feeService.findAllConfig();
  }

  @Get('/internal/purchasing')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate purchase fee' })
  @ApiOkResponse({ type: PurchasingFeeDto })
  async purchasing(@Query() filter: FilterPurchasingFeeDto) {
    console.log({ filter });
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(filter);
    return purchaseFeeDto;
  }

  @Get('/internal/withdraw')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate withdraw fee' })
  @ApiOkResponse({ type: PurchasingFeeDto })
  async withdraw(@Query() filter: FilterWithdrawFeeDto) {
    const withdrawFeeDto =
      await this.withdrawFeeService.calculateWithdrawFee(filter);
    return withdrawFeeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_purchase' })
  async purchasingTCP(filter: FilterPurchasingFeeDto) {
    console.log({ filter });
    console.log('ANJING');
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(filter);
    return purchaseFeeDto;
  }
}
