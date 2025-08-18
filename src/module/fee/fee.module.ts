import { Module } from '@nestjs/common';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { CommonModule } from '../common/common.module';
import { PurchaseFeeService } from './purchase-fee.service';
import { WithdrawFeeService } from './withdraw-fee.service';

@Module({
  controllers: [FeeController],
  providers: [FeeService, PurchaseFeeService, WithdrawFeeService],
  exports: [FeeService, PurchaseFeeService, WithdrawFeeService],
  imports: [CommonModule],
})
export class FeeModule {}
