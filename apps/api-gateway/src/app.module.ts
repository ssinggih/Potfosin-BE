import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AuthController } from './controllers/auth.controller';
import { ProjectController } from './controllers/project.controller';
import { TechController } from './controllers/tech.controller';
import { UserController } from './controllers/user.controller';
import { UploadController } from './controllers/upload.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CorrelationIdMiddleware } from '@common/middleware/correlation-id.middleware';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: Number(process.env.REDIS_TTL || 3600),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    ProjectController,
    TechController,
    UserController,
    UploadController,
  ],
  providers: [
    {
      provide: 'PORTFOLIO_SERVICE',
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('PORTFOLIO_SERVICE_HOST', 'localhost'),
            port: Number(configService.get('PORTFOLIO_SERVICE_TCP_PORT', 4001)),
          },
        }),
      inject: [ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, LoggerMiddleware)
      .forRoutes('*')
      .apply(AuthMiddleware)
      .exclude('auth/login', 'auth/register', 'health', '/api/v1/auth/(.*)', '/api/v1/health')
      .forRoutes('*');
  }
}
