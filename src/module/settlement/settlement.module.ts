import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';

@Module({
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
  imports: [CommonModule],
})
export class SettlementModule {}
