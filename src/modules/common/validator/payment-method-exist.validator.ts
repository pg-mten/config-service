import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CommonService } from 'src/modules/common/common.service';
import { CommonDiv } from 'src/shared/constant/fee.constant';

@Injectable()
@ValidatorConstraint({ async: true })
export class PaymentMethodExistValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly commonService: CommonService) {}

  private readonly div = CommonDiv.PAYMENT_METHOD;

  async validate(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      await this.commonService.findByDivAndValueThrow(this.div, value);
      return true;
    } catch {
      return false;
    }
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `Common ${this.div} with value ${validationArguments?.value} not exist`;
  }
}

export function PaymentMethodExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PaymentMethodExistValidator,
    });
  };
}
