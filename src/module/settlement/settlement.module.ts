import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
  imports: [
    CommonModule,
    ClientsModule.register([
      {
        name: 'TRANSACTION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 4002,
        },
      },
    ]),
  ],
})
export class SettlementModule {}
