import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CommonService } from 'src/module/common/common.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class PaymentMethodExistValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly commonService: CommonService) {}

  private readonly div = 'PAYMENT_METHOD';

  async validate(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const common = await this.commonService.findByDivAndValue(this.div, value);
    if (!common) return false;
    return true;
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
