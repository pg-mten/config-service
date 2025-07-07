import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app/app.module';
import {
  API_PREFIX,
  IS_DEVELOPMENT,
  PORT,
  VERSION,
} from './shared/constant/global.constant';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // class-validator ngikut DI Nest

  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  if (IS_DEVELOPMENT) {
    const options = new DocumentBuilder()
      .setTitle('Auth Service')
      .setDescription('Auth Service API Description')
      .setVersion(VERSION)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(PORT, () => {
    console.log(`Config service started listening: ${PORT}`);
  });
}

bootstrap();
