import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import Decimal from 'decimal.js';
import { ToDecimal } from 'src/decorator/decimal.decorator';
import { ActionEnum } from 'src/shared/constant/merchant-fee.constant';

export class UpsertMerchantAgentShareholderDto {
  @IsEnum(ActionEnum)
  @ApiProperty({ enum: ActionEnum, example: ActionEnum.U })
  action: ActionEnum;

  @ApiProperty()
  agentId: number;

  @ApiProperty({ type: Decimal })
  @ToDecimal()
  percentagePerAgent: Decimal;
}
