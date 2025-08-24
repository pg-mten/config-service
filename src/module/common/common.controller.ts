import { Controller, Get, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonDto } from './dto/common.dto';
import { FilterCommonDto } from './dto/filter-common.dto';

@Controller('common')
@ApiTags('Common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('div')
  @ApiOperation({ summary: 'Find common by div' })
  @ApiOkResponse({ type: CommonDto, isArray: true })
  async findManyByDiv(@Query() filter: FilterCommonDto) {
    console.log({ filter });
    const commons = await this.commonService.findManyByDiv(filter);
    return commons;
  }
}
