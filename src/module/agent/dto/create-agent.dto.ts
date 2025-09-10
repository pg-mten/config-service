import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;
}
