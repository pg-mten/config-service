import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { AgentFeeDto } from 'src/module/agent/dto/agent-fee.dto';

export class MerchantFeeDto {
  constructor(data: MerchantFeeDto) {
    Object.assign(this, data);
  }
  @ToDecimalFixed()
  @Type(() => Decimal)
  @ApiProperty({ type: Decimal })
  nominal: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  merchantNetAmount: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  agentFeeTotal: Decimal;

  @ApiProperty({ type: AgentFeeDto, isArray: true })
  agentFees: Array<AgentFeeDto>;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  providerFee: Decimal;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  internalFee: Decimal;
}
