import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import * as compression from "compression";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "@common/filters/all-exceptions.filter";
import { TransformInterceptor } from "@common/interceptors/transform.interceptor";
import { LoggingInterceptor } from "@common/interceptors/logging.interceptor";
import { TimeoutInterceptor } from "@common/interceptors/timeout.interceptor";
import { ETagInterceptor } from "@common/interceptors/etag.interceptor";
import { HttpCacheMiddleware } from "@common/middleware/http-cache.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  app.setGlobalPrefix(configService.get("GATEWAY_PREFIX", "api/v1"));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            "'self'",
            "data:",
            "https://portfolio-images.r2.dev",
            "https://*.vercel.app",
          ],
        },
      },
    }),
  );
  app.use(compression());

  const httpCacheMiddleware = app.get(HttpCacheMiddleware);
  app.use(httpCacheMiddleware.use.bind(httpCacheMiddleware));

  app.enableCors({
    origin: configService.get("CORS_ORIGIN", "*"),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
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
    new ETagInterceptor(app.get('Reflector')),
    new TimeoutInterceptor(30000),
  );

  const port = configService.get("GATEWAY_PORT", 3000);
  await app.listen(port);
  logger.log(`API Gateway running on http://localhost:${port}`);
}
bootstrap();
