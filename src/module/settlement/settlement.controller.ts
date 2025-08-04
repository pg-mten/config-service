import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SettlementService } from './settlement.service';
import { SettlementScheduleDto } from './dto/settlementSchedule.dto';

@Controller('fee')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get('settlement-scheduler')
  @ApiOperation({ summary: 'Settlement Scheduler' })
  @ApiOkResponse({})
  async settlementScheduler(@Query() query: SettlementScheduleDto) {
    return this.settlementService.runForInterval(query.interval);
  }
}
