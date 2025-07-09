import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MerchantService } from '../merchant.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class MerchantExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly merchantServie: MerchantService) {}

  async validate(
    value: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const merchant = await this.merchantServie.findById(value);
    if (!merchant) return false;
    return true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `Merchant with id [${validationArguments?.value}] not exist`;
  }
}

export function MerchantExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MerchantExistValidator,
    });
  };
}
