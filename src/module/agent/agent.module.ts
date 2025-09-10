import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
  imports: [HttpModule],
})
export class AgentModule {}
