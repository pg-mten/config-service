import { AgentFeeSystemDto } from './agent-fee.system.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MerchantFeeSystemDto } from './merchant-fee.system.dto';
import { ProviderFeeSystemDto } from './provider-fee.system.dto';
import { InternalFeeSystemDto } from './internal-fee.system.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class WithdrawFeeSystemDto {
  constructor(data: WithdrawFeeSystemDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: MerchantFeeSystemDto })
  merchantFee: MerchantFeeSystemDto;

  @ApiProperty({ type: AgentFeeSystemDto })
  agentFee: AgentFeeSystemDto;

  @ApiProperty({ type: ProviderFeeSystemDto })
  providerFee: ProviderFeeSystemDto;

  @ApiProperty({ type: InternalFeeSystemDto })
  internalFee: InternalFeeSystemDto;
}
