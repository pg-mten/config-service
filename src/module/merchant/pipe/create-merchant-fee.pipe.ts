import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { InvalidRequestException } from 'src/exception/invalid-request.exception';
import { CommonService } from 'src/module/common/common.service';
import { CreateMerchantAgentFeeDto } from 'src/module/merchant/dto/create-merchant-agent-fee.dto';
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
        all: 'Must be an array CreateMerchantAgentFeeDto',
      };
      throw new InvalidRequestException(responseDto);
    }

    // const CreateMerchantFeeAgentDtos = value as CreateMerchantAgentFeeDto[];
    // const uniqueProviders = [
    //   ...new Set(CreateMerchantFeeAgentDtos.map((e) => e.)),
    // ];
    // const uniquePaymentMethods = [
    //   ...new Set(CreateMerchantFeeAgentDtos.map((e) => e.paymentMethodName)),
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
    //   return CreateMerchantFeeAgentDtos; // Continue to controller

    // responseDto.error = {
    //   all: 'There are invalid provider name or payment method name',
    // };
    // throw new InvalidRequestException(responseDto);
  }
}
