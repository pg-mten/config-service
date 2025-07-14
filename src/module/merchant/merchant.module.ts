import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { MerchantExistValidator } from './validator/merchant-exist.validator';
import { CreateMerchantFeePipe } from './pipe/create-merchant-fee.pipe';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService, MerchantExistValidator, CreateMerchantFeePipe],
  exports: [MerchantService, MerchantExistValidator, CreateMerchantFeePipe],
  imports: [CommonModule],
})
export class MerchantModule {}
