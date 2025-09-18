import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SettlementSchedulerController } from './settlement-scheduler.controller';
import { SettlementSchedulerService } from './settlement-scheduler.service';

@Module({
  controllers: [SettlementSchedulerController],
  providers: [SettlementSchedulerService],
  exports: [SettlementSchedulerService],
  imports: [CommonModule],
})
export class SettlementSchedulerModule {}
