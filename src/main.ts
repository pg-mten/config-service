import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import {
  API_PREFIX,
  APP_NAME,
  IS_DEVELOPMENT,
  PORT,
  VERSION,
} from './shared/constant/global.constant';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { logger } from './shared/constant/logger.constant';
import { SERVICES } from 'src/shared/constant/client.constant';
import { MetricsMiddleware } from './middlewares/metrics.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance: logger }),
    bufferLogs: true,
  });
  app.use(new MetricsMiddleware().use);

  app.setGlobalPrefix(API_PREFIX, {
    exclude: ['/metrics'],
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // class-validator ngikut DI Nest

  // TODO jangan sampai production, origin set true demi development dan testing
  app.enableCors({
    origin: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    // allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // if (IS_DEVELOPMENT) {
  const options = new DocumentBuilder()
    .setTitle(`${APP_NAME} Service`)
    .setDescription(`${APP_NAME} Service API Description`)
    .setVersion(VERSION)
    .addServer('http://localhost:3001', 'Local')
    .addServer(`https://api.manapay.id/config`, 'Production') // Adjust with Server Proxy
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(API_PREFIX, app, document);
  // }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: SERVICES.CONFIG.host,
      port: SERVICES.CONFIG.port,
    },
  });
  app.enableShutdownHooks();
  await app.startAllMicroservices();

  await app.listen(PORT, () => {
    console.log(`Config service started listening: ${PORT}`);
  });
}

bootstrap();
