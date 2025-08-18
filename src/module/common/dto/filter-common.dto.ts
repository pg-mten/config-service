import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CommonDiv } from 'src/shared/constant/fee.constant';

export class FilterCommonDto {
  @IsEnum(CommonDiv)
  @ApiProperty({ enum: CommonDiv, example: CommonDiv.PAYMENT_METHOD })
  div: CommonDiv;
}
