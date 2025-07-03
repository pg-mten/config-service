import { Controller, Get, Request, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorator/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get('/')
  getHello(): string {
    return this.appService.getHello();
  }
}
