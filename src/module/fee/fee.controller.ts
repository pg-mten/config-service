import { Controller, Get, Query } from '@nestjs/common';
import { FeeService } from './fee.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchasingFeeSystemDto } from './dto/purchashing-fee.system.dto';
import { FilterPurchasingFeeDto } from './dto/filter-purchasing-fee.dto';
import { BaseFeeSystemDto } from './dto/base-fee.system.dto';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';
import { FilterWithdrawFeeDto } from './dto/filter-withdraw-fee.dto';
import { MessagePattern } from '@nestjs/microservices';
import { WithdrawFeeSystemDto } from './dto/withdraw-fee.system.dto';

@Controller('fee')
export class FeeController {
  constructor(
    private readonly feeService: FeeService,
    private readonly purchaseFeeService: PurchaseFeeService,
    private readonly withdrawFeeService: WithdrawFeeService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'List All Provider fee configuration' })
  @ApiOkResponse({ type: BaseFeeSystemDto, isArray: true })
  async config() {
    return this.feeService.findAllConfig();
  }

  @Get('/internal/purchasing')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate purchase fee' })
  @ApiOkResponse({ type: PurchasingFeeSystemDto })
  async purchasing(@Query() filter: FilterPurchasingFeeDto) {
    console.log({ filter });
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(filter);
    return purchaseFeeDto;
  }

  @Get('/internal/withdraw')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate withdraw fee' })
  @ApiOkResponse({ type: WithdrawFeeSystemDto })
  async withdraw(@Query() filter: FilterWithdrawFeeDto) {
    const withdrawFeeDto =
      await this.withdrawFeeService.calculateWithdrawFee(filter);
    return withdrawFeeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_withdraw' })
  async withdrawTCP(filter: FilterWithdrawFeeDto) {
    const purchaseFeeDto =
      await this.withdrawFeeService.calculateWithdrawFee(filter);
    return purchaseFeeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_purchase' })
  async purchasingTCP(filter: FilterPurchasingFeeDto) {
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(filter);
    return purchaseFeeDto;
  }
}
