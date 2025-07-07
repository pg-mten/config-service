import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';

export class AgentFeeDto {
  constructor(data: AgentFeeDto) {
    Object.assign(this, data);
  }
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ToDecimalFixed()
  @ApiProperty({ type: Decimal })
  nominal!: Decimal;
}
