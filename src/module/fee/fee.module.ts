import { Module } from '@nestjs/common';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { CommonModule } from '../common/common.module';
import { PurchaseFeeService } from './purchase-fee.service';

@Module({
  controllers: [FeeController],
  providers: [FeeService, PurchaseFeeService],
  exports: [FeeService, PurchaseFeeService],
  imports: [CommonModule],
})
export class FeeModule {}
