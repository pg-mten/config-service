import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DivExist } from '../validator/div-exist.validator';

export class QueryCommonDto {
  // @DivExist()
  @IsString()
  @ApiProperty({ example: 'PAYMENT_METHOD' })
  div: string;
}
