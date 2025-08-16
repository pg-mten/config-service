import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CommonDiv } from 'src/shared/constant/fee.constant';

export class FilterCommonDto {
  // @DivExist()
  @IsEnum({ type: CommonDiv })
  @ApiProperty({ example: CommonDiv.PAYMENT_METHOD })
  div: CommonDiv;
}
