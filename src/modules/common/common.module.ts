import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { PaymentMethodExistValidator } from './validator/payment-method-exist.validator';
import { ProviderExistValidator } from './validator/provider-exist.validator';

@Module({
  controllers: [CommonController],
  providers: [
    CommonService,
    PaymentMethodExistValidator,
    ProviderExistValidator,
  ],
  exports: [CommonService, PaymentMethodExistValidator, ProviderExistValidator],
})
export class CommonModule {}
