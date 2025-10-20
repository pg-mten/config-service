import { Module } from '@nestjs/common';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { CommonModule } from '../common/common.module';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';
import { TopupFeeService } from './topup-fee.service';
import { DisbursementFeeService } from './disbursement-fee.service';

@Module({
  controllers: [FeeController],
  providers: [
    FeeService,
    PurchaseFeeService,
    WithdrawFeeService,
    TopupFeeService,
    DisbursementFeeService,
  ],
  exports: [
    FeeService,
    PurchaseFeeService,
    WithdrawFeeService,
    TopupFeeService,
    DisbursementFeeService,
  ],
  imports: [CommonModule],
})
export class FeeModule {}
