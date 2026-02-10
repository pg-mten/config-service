import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { FeeService } from './fee.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchaseFeeSystemDto } from './dto-transaction-system/purchase-fee.system.dto';
import { FilterPurchaseFeeSystemDto } from './dto-transaction-system/filter-purchase-fee.system.dto';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';
import { FilterWithdrawFeeSystemDto } from './dto-transaction-system/filter-withdraw-fee.system.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WithdrawFeeSystemDto } from './dto-transaction-system/withdraw-fee.system.dto';
import { BaseFeeDto } from '../merchant/dto-response/base-fee.dto';
import { TopupFeeService } from './topup-fee.service';
import { DisbursementFeeService } from './disbursement-fee.service';
import { FilterTopupFeeSystemDto } from './dto-transaction-system/filter-topup-fee.system.dto';
import { FilterDisbursementFeeSystemDto } from './dto-transaction-system/filter-disbursement-fee.system.dto';
import { TopupFeeSystemDto } from './dto-transaction-system/topup-fee.system.dto';
import { DisbursementFeeSystemDto } from './dto-transaction-system/disbursement-fee.system.dto';
import { CustomValidationPipe } from 'src/shared/pipe';
import { ResponseInterceptor } from 'src/shared/interceptor';
import { SERVICES } from 'src/shared/constant/client.constant';
import { SystemApi } from 'src/microservice/auth/decorator';

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
  @SystemApi()
  @Get('/internal/purchase')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Purchase fee' })
  @ApiOkResponse({ type: PurchaseFeeSystemDto })
  async purchasing(@Query() filter: FilterPurchaseFeeSystemDto) {
    console.log({ filter });
    const feeDto = await this.purchaseFeeService.calculatePurchaseFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.cmd.calculate_fee_purchase })
  @UseInterceptors(ResponseInterceptor)
  async purchaseTCP(
    @Payload(CustomValidationPipe)
    payload: FilterPurchaseFeeSystemDto,
  ) {
    const purchaseFeeDto =
      await this.purchaseFeeService.calculatePurchaseFee(payload);
    return purchaseFeeDto;
  }

  /**
   * Withdraw Calculate
   */
  @SystemApi()
  @Get('/internal/withdraw')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Withdraw fee' })
  @ApiOkResponse({ type: WithdrawFeeSystemDto })
  async withdraw(@Query() filter: FilterWithdrawFeeSystemDto) {
    const feeDto = await this.withdrawFeeService.calculateWithdrawFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.cmd.calculate_fee_withdraw })
  @UseInterceptors(ResponseInterceptor)
  async withdrawTCP(
    @Payload(CustomValidationPipe)
    payload: FilterWithdrawFeeSystemDto,
  ) {
    const feeDto = await this.withdrawFeeService.calculateWithdrawFee(payload);
    return feeDto;
  }

  /**
   * Topup Calculate
   */
  @SystemApi()
  @Get('/internal/topup')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Top Up fee' })
  @ApiOkResponse({ type: TopupFeeSystemDto })
  async topup(@Query() filter: FilterTopupFeeSystemDto) {
    const feeDto = await this.topupFeeService.calculateTopupFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.cmd.calculate_fee_topup })
  @UseInterceptors(ResponseInterceptor)
  async topupTCP(
    @Payload(CustomValidationPipe)
    payload: FilterTopupFeeSystemDto,
  ) {
    const feeDto = await this.topupFeeService.calculateTopupFee(payload);
    return feeDto;
  }

  /**
   * Disbursement Calculate
   */
  @SystemApi()
  @Get('/internal/disbursement')
  @ApiTags('Internal')
  @ApiOperation({ summary: 'Calculate Disbursement fee' })
  @ApiOkResponse({ type: DisbursementFeeSystemDto })
  async disbursement(@Query() filter: FilterDisbursementFeeSystemDto) {
    const feeDto =
      await this.disbursementService.calculateDisbursementFee(filter);
    return feeDto;
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.cmd.calculate_fee_disbursement })
  @UseInterceptors(ResponseInterceptor)
  async disbursementTCP(
    @Payload(CustomValidationPipe)
    payload: FilterDisbursementFeeSystemDto,
  ) {
    const feeDto =
      await this.disbursementService.calculateDisbursementFee(payload);
    return feeDto;
  }
}
