import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SettlementSchedulerService } from './settlement-scheduler.service';
import { SettlementScheduleDto } from './dto/settlement-schedule.dto';

@Controller('fee')
export class SettlementSchedulerController {
  constructor(
    private readonly settlementSchedulerService: SettlementSchedulerService,
  ) {}

  @Get('settlement-scheduler')
  @ApiOperation({ summary: 'Settlement Scheduler' })
  @ApiOkResponse({})
  async settlementScheduler(@Query() query: SettlementScheduleDto) {
    return this.settlementSchedulerService.runForInterval(query.interval);
  }
}
