import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SettlementScheduleDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 30 })
  interval: number;
}
