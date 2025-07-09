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
import { PrismaModule } from '../prisma/prisma.module';
import { MerchantModule } from '../merchant/merchant.module';
import { CommonModule } from '../common/common.module';
import { FeeModule } from '../fee/fee.module';

@Module({
  imports: [
    PrismaModule,
    /// System Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),

    MerchantModule,
    CommonModule,
    FeeModule,
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
