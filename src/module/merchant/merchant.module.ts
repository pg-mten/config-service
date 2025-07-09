import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { MerchantExistValidator } from './validator/merchant-exist.validator';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService, MerchantExistValidator],
  exports: [MerchantService, MerchantExistValidator],
})
export class MerchantModule {}
