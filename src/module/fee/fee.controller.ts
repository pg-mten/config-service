import { Controller, Get, Query } from '@nestjs/common';
import { FeeService } from './fee.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchaseFeeSystemDto } from './dto-transaction-system/purchase-fee.system.dto';
import { FilterPurchaseFeeSystemDto } from './dto-transaction-system/filter-purchase-fee.system.dto';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';
import { FilterWithdrawFeeSystemDto } from './dto-transaction-system/filter-withdraw-fee.system.dto';
import { MessagePattern } from '@nestjs/microservices';
import { WithdrawFeeSystemDto } from './dto-transaction-system/withdraw-fee.system.dto';
import { BaseFeeDto } from '../merchant/dto-response/base-fee.dto';
import { TopupFeeService } from './topup-fee.service';
import { DisbursementFeeService } from './disbursement-fee.service';
import { FilterTopupFeeSystemDto } from './dto-transaction-system/filter-topup-fee.system.dto';
import { FilterDisbursementFeeSystemDto } from './dto-transaction-system/filter-disbursement-fee.system.dto';
import { TopupFeeSystemDto } from './dto-transaction-system/topup-fee.system.dto';
import { DisbursementFeeSystemDto } from './dto-transaction-system/disbursement-fee.system.dto';

@Controller('fee')
export class FeeController {
  constructor(
    private readonly feeService: FeeService,
    private readonly purchaseFeeService: PurchaseFeeService,
    private readonly withdrawFeeService: WithdrawFeeService,
    private readonly topupFeeService: TopupFeeService,
    private readonly disbursementService: DisbursementFeeService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'List All Provider fee configuration' })
  @ApiOkResponse({ type: BaseFeeDto, isArray: true })
  async config() {
    return this.feeService.findAllConfig();
  }

  /**
   * Purchase Calculate
   */
  @Get('/internal/purchase')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Purchase fee' })
  @ApiOkResponse({ type: PurchaseFeeSystemDto })
  async purchasing(@Query() filter: FilterPurchaseFeeSystemDto) {
    console.log({ filter });
    const feeDto = await this.purchaseFeeService.calculatePurchaseFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_purchase' })
  async purchaseTCP(filter: FilterPurchaseFeeSystemDto) {
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(filter);
    return purchaseFeeDto;
  }

  /**
   * Withdraw Calculate
   */
  @Get('/internal/withdraw')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Withdraw  fee' })
  @ApiOkResponse({ type: WithdrawFeeSystemDto })
  async withdraw(@Query() filter: FilterWithdrawFeeSystemDto) {
    const feeDto = await this.withdrawFeeService.calculateWithdrawFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_withdraw' })
  async withdrawTCP(filter: FilterWithdrawFeeSystemDto) {
    const feeDto = await this.withdrawFeeService.calculateWithdrawFee(filter);
    return feeDto;
  }

  /**
   * Topup Calculate
   */
  @Get('/internal/topup')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Top Up fee' })
  @ApiOkResponse({ type: TopupFeeSystemDto })
  async topup(@Query() filter: FilterTopupFeeSystemDto) {
    const feeDto = await this.topupFeeService.calculateTopupFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_topup' })
  async topupTCP(filter: FilterTopupFeeSystemDto) {
    const feeDto = await this.topupFeeService.calculateTopupFee(filter);
    return feeDto;
  }

  /**
   * Disbursement Calculate
   */
  @Get('/internal/disbursement')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Disbursement fee' })
  @ApiOkResponse({ type: DisbursementFeeSystemDto })
  async disbursement(@Query() filter: FilterDisbursementFeeSystemDto) {
    const feeDto =
      await this.disbursementService.calculateDisbursementFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: 'calculate_fee_disbursement' })
  async disbursementTCP(filter: FilterDisbursementFeeSystemDto) {
    const feeDto =
      await this.disbursementService.calculateDisbursementFee(filter);
    return feeDto;
  }
}
