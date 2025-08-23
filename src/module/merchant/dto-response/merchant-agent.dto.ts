import { ApiProperty } from '@nestjs/swagger';
import { MerchantDto } from './merchant.dto';
import { AgentDto } from './agent.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class MerchantAgentDto {
  constructor(data: MerchantAgentDto) {
    DtoHelper.assign(this, data);
  }
  @ApiProperty({ type: MerchantDto })
  merchant: MerchantDto;

  @ApiProperty({ type: AgentDto, isArray: true })
  agents: AgentDto[];
}
