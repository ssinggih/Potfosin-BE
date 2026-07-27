import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@database/database.module';
import { AppController } from './app.controller';
import { AuthController } from './controllers/auth.controller';
import { ProjectController } from './controllers/project.controller';
import { TechController } from './controllers/tech.controller';
import { UserController } from './controllers/user.controller';
import { UploadController } from './controllers/upload.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CorrelationIdMiddleware } from '@common/middleware/correlation-id.middleware';
import { HttpCacheMiddleware } from '@common/middleware/http-cache.middleware';
import { AuthService } from '../../portfolio-service/src/auth/auth.service';
import { ProjectsService } from '../../portfolio-service/src/projects/projects.service';
import { TechsService } from '../../portfolio-service/src/techs/techs.service';
import { UsersService } from '../../portfolio-service/src/users/users.service';
import { ImagesService } from '../../portfolio-service/src/images/images.service';
import { R2Service } from '../../portfolio-service/src/uploads/r2.service';

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
    DatabaseModule,
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
    HttpCacheMiddleware,
    AuthService,
    ProjectsService,
    TechsService,
    UsersService,
    ImagesService,
    R2Service,
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
