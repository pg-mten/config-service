import { Controller, Get, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommonDto } from './dto/common.dto';
import { QueryCommonDto } from './dto/query-common.dto';

@Controller('common')
@ApiTags('Common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('div')
  @ApiOperation({ summary: 'Find common by div' })
  @ApiOkResponse({ type: CommonDto, isArray: true })
  async findManyByDiv(@Query() query: QueryCommonDto) {
    console.log({ query });
    const { div } = query;
    const commons = await this.commonService.findManyByDiv(div);
    return commons;
  }
}
