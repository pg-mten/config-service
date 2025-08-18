import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateMerchantDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  settlementInterval?: number;
}
