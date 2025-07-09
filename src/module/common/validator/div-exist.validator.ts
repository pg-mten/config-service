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
export class DivExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly commonService: CommonService) {}

  async validate(
    div: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const commons = await this.commonService.findManyByDiv(div);
    if (commons.length === 0) return false;
    return true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `Common ${validationArguments?.value} not exist`;
  }
}

export function DivExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DivExistValidator,
    });
  };
}
