import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@database/database.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { TechsController } from './techs/techs.controller';
import { TechsService } from './techs/techs.service';
import { ImagesController } from './images/images.controller';
import { ImagesService } from './images/images.service';
import { R2Service } from './uploads/r2.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
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
    AuthController,
    UsersController,
    ProjectsController,
    TechsController,
    ImagesController,
  ],
  providers: [
    AuthService,
    UsersService,
    ProjectsService,
    TechsService,
    ImagesService,
    R2Service,
  ],
})
export class PortfolioModule {}
