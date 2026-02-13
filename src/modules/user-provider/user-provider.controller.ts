import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserProviderService } from './user-provider.service';
import { FilterProfileProviderSystemDto } from 'src/microservice/config/dto-system/filter-profile-provider.system.dto';
import { SystemApi } from 'src/microservice/auth/decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICES } from 'src/shared/constant/client.constant';
import { CustomValidationPipe } from 'src/shared/pipe';

@Controller()
@ApiTags('User Provider')
export class UserProviderController {
  constructor(private readonly userProviderService: UserProviderService) {}

  @SystemApi()
  @ApiTags('Internal')
  @Get(SERVICES.CONFIG.point.find_profile_provider.path)
  async findProfileProvider(@Query() filter: FilterProfileProviderSystemDto) {
    console.log({ filter });
    return this.userProviderService.findProfileProvider(filter);
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.point.find_profile_provider.cmd })
  async findProfileProviderTCP(
    @Payload(CustomValidationPipe) payload: FilterProfileProviderSystemDto,
  ) {
    console.log({ payload });
    return this.userProviderService.findProfileProvider(payload);
  }
}
