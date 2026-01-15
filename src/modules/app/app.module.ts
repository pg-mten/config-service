import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  APP_FILTER,
  APP_INTERCEPTOR,
  APP_PIPE,
  HttpAdapterHost,
  Reflector,
} from '@nestjs/core';
import { CustomValidationPipe } from 'src/pipe/custom-validation.pipe';
import { PrismaClientKnownExceptionFilter } from 'src/filter/prisma-client-known.exception.filter';
import { ResponseExceptionFilter } from 'src/filter/response.exception.filter';
import { InvalidRequestExceptionFilter } from 'src/filter/invalid-request.exception.filter';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { AllExceptionsFilter } from 'src/filter/all.exceptions.filter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { FeeModule } from '../fee/fee.module';
import { MerchantModule } from '../merchant/merchant.module';
import { SettlementSchedulerModule } from '../settlement-scheduler/settlement-scheduler.module';
import { ReconciliationModule } from '../reconciliation/reconciliation.module';
import { AgentModule } from '../agent/agent.module';
import { MicroserviceModule } from 'src/microservice/microservice.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { UserProviderModule } from '../user-provider/user-provider.module';

@Module({
  imports: [
    /// System Configuration
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    ScheduleModule.forRoot(),

    CommonModule,
    FeeModule,
    MerchantModule,
    SettlementSchedulerModule,
    ReconciliationModule,
    AgentModule,
    UserProviderModule,

    MicroserviceModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /// PIPE
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },

    /// FILTER
    // {
    //   provide: APP_FILTER, // Lowest priority
    //   useFactory: (httpAdapterHost: HttpAdapterHost) => {
    //     return new AllExceptionsFilter(httpAdapterHost);
    //   },
    //   inject: [HttpAdapterHost],
    // },
    {
      provide: APP_FILTER,
      useClass: PrismaClientKnownExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ResponseExceptionFilter,
    },
    {
      provide: APP_FILTER, // Highest priority
      useClass: InvalidRequestExceptionFilter,
    },

    /// INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => {
        return new ClassSerializerInterceptor(reflector);
      },
      inject: [Reflector],
    },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },

    /// GUARD
  ],
})
export class AppModule {}
