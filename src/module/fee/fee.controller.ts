import { Controller, Get, Query } from '@nestjs/common';
import { FeeService } from './fee.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PurchasingFeeDto } from './dto/purchashing-fee.dto';
import { QueryPurchasingFeeDto } from './dto/query-purchasing-fee.dto';

@Controller('fee')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Get('purchasing')
  @ApiOperation({ summary: 'Calculate purchasing fee' })
  @ApiOkResponse({ type: PurchasingFeeDto })
  async purchasing(@Query() query: QueryPurchasingFeeDto) {
    // return query;
    const purchasingFeeDto = await this.feeService.calculatePuchasingFee(query);
    return purchasingFeeDto;
  }
}
