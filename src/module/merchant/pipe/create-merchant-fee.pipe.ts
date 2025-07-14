import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InvalidRequestException } from 'src/exception/invalid-request.exception';
import { CommonService } from 'src/module/common/common.service';
import { CreateMerchantFeeDto } from 'src/module/merchant/dto/create-merchant-fee.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';

@Injectable()
export class CreateMerchantFeePipe implements PipeTransform {
  constructor(private readonly commonService: CommonService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    return Promise.resolve();
    const responseDto = new ResponseDto<null>({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: ResponseStatus.ERROR,
      message: 'Request Validation Failed',
    });
    if (!Array.isArray(value)) {
      responseDto.error = {
        all: 'Must be an array CreateMerchantFeeDto',
      };
      throw new InvalidRequestException(responseDto);
    }

    // const createMerchantFeeDtos = value as CreateMerchantFeeDto[];
    // const uniqueProviders = [
    //   ...new Set(createMerchantFeeDtos.map((e) => e.)),
    // ];
    // const uniquePaymentMethods = [
    //   ...new Set(createMerchantFeeDtos.map((e) => e.paymentMethodName)),
    // ];

    // const commonProviders = await this.commonService.divAndValueIsExist(
    //   'PROVIDER',
    //   uniqueProviders,
    // );
    // const commonPaymentMethods = await this.commonService.divAndValueIsExist(
    //   'PAYMENT_METHOD',
    //   uniquePaymentMethods,
    // );

    // if (
    //   uniqueProviders.length + uniquePaymentMethods.length ===
    //   commonProviders.length + commonPaymentMethods.length
    // )
    //   return createMerchantFeeDtos; // Continue to controller

    // responseDto.error = {
    //   all: 'There are invalid provider name or payment method name',
    // };
    // throw new InvalidRequestException(responseDto);
  }
}
