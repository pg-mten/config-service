import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { PaymentMethodExistValidator } from './validator/payment-method-exist.validator';
import { ProviderExistValidator } from './validator/provider-exist.validator';
import { DivExistValidator } from './validator/div-exist.validator';

@Module({
  controllers: [CommonController],
  providers: [
    CommonService,
    PaymentMethodExistValidator,
    ProviderExistValidator,
    DivExistValidator,
  ],
  exports: [
    CommonService,
    PaymentMethodExistValidator,
    ProviderExistValidator,
    DivExistValidator,
  ],
})
export class CommonModule {}
