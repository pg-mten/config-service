import { Module } from '@nestjs/common';
import { UserProviderController } from './user-provider.controller';
import { UserProviderService } from './user-provider.service';

@Module({
  controllers: [UserProviderController],
  providers: [UserProviderService],
  exports: [UserProviderService],
})
export class UserProviderModule {}
