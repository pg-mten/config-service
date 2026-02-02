import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserProviderService } from './user-provider.service';
import { FilterProfileProviderSystemDto } from 'src/microservice/config/dto-system/filter-profile-provider.system.dto';
import { SystemApi } from 'src/microservice/auth/decorator/system.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICES } from 'src/microservice/client.constant';
import { ResponseInterceptor } from 'src/shared/interceptor';
import { CustomValidationPipe } from 'src/shared/pipe';

@Controller('user-provider')
@ApiTags('User Provider')
export class UserProviderController {
  constructor(private readonly userProviderService: UserProviderService) {}

  @SystemApi()
  @ApiTags('Internal')
  @Get('internal/profile-provider')
  async findProfileProvider(@Query() filter: FilterProfileProviderSystemDto) {
    console.log({ filter });
    return this.userProviderService.findProfileProvider(filter);
  }

  @MessagePattern({ cmd: SERVICES.CONFIG.cmd.find_profile_provider })
  @UseInterceptors(ResponseInterceptor)
  async findProfileProviderTCP(
    @Payload(CustomValidationPipe) payload: FilterProfileProviderSystemDto,
  ) {
    console.log({ payload });
    return this.userProviderService.findProfileProvider(payload);
  }
}
