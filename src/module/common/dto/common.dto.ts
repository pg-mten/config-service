import { ApiProperty } from '@nestjs/swagger';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class CommonDto {
  constructor(data: CommonDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty()
  name: string;
}
