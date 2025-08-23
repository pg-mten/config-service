import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app/app.module';
import {
  API_PREFIX,
  APP_NAME,
  IS_DEVELOPMENT,
  PORT,
  VERSION,
} from './shared/constant/global.constant';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // class-validator ngikut DI Nest

  // TODO jangan sampai production, origin set true demi development dan testing
  app.enableCors({
    origin: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    // allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  if (IS_DEVELOPMENT) {
    const options = new DocumentBuilder()
      .setTitle(`${APP_NAME} Service`)
      .setDescription(`${APP_NAME} Service API Description`)
      .setVersion(VERSION)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(API_PREFIX, app, document);
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 4001,
    },
  });
  await app.startAllMicroservices();
  await app.listen(PORT, () => {
    console.log(`Config service started listening: ${PORT}`);
  });
}

bootstrap();
