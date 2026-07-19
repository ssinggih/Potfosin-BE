import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { PortfolioModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(PortfolioModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('PortfolioService');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const tcpPort = configService.get('PORTFOLIO_SERVICE_TCP_PORT', 4001);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: configService.get('PORTFOLIO_SERVICE_HOST', '0.0.0.0'),
      port: Number(tcpPort),
    },
  });

  await app.startAllMicroservices();
  logger.log(`Portfolio microservice running on TCP port ${tcpPort}`);
}
bootstrap();
