import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({ type: Number })
  id: number;
}
