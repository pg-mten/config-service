import { ApiProperty } from '@nestjs/swagger';

export class CommonDto {
  constructor(data: CommonDto) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  div: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  explain: string;
}
