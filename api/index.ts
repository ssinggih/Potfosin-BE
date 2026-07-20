import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from '../apps/api-gateway/src/app.module';
import { AllExceptionsFilter } from '../libs/common/src/filters/all-exceptions.filter';
import { TransformInterceptor } from '../libs/common/src/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../libs/common/src/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '../libs/common/src/interceptors/timeout.interceptor';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix(configService.get('GATEWAY_PREFIX', 'api/v1'));

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(30000),
  );

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export const handler = async (event: any, context: any, callback: any) => {
  if (!cachedServer) {
    const expressApp = await bootstrap();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer(event, context, callback);
};
