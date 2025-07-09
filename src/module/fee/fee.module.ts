import { Module } from '@nestjs/common';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [FeeController],
  providers: [FeeService],
  exports: [FeeService],
  imports: [CommonModule],
})
export class FeeModule {}
