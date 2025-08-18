import { Controller, Get, Query } from '@nestjs/common';
import { FeeService } from './fee.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PurchasingFeeDto } from './dto/purchashing-fee.dto';
import { FilterPurchasingFeeDto } from './dto/filter-purchasing-fee.dto';
import { BaseFeeDto } from './dto/base-fee.dto';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';
import { FilterWithdrawFeeDto } from './dto/filter-withdraw-fee.dto';

@Controller('fee')
export class FeeController {
  constructor(
    private readonly feeService: FeeService,
    private readonly purchaseFeeService: PurchaseFeeService,
    private readonly withdrawFeeService: WithdrawFeeService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'List Internal and Provider fee configuration' })
  @ApiOkResponse({ type: BaseFeeDto, isArray: true })
  async config() {
    return this.feeService.findAllConfig();
  }

  @Get('purchasing')
  @ApiOperation({ summary: 'Calculate purchasing fee' })
  @ApiOkResponse({ type: PurchasingFeeDto })
  async purchasing(@Query() filter: FilterPurchasingFeeDto) {
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(filter);
    return purchaseFeeDto;
  }

  @Get('withdraw')
  @ApiOperation({ summary: 'Calculate purchasing fee' })
  @ApiOkResponse({ type: PurchasingFeeDto })
  async withdraw(@Query() filter: FilterWithdrawFeeDto) {
    const withdrawFeeDto =
      await this.withdrawFeeService.calculateWithdrawFee(filter);
    return withdrawFeeDto;
  }
}
