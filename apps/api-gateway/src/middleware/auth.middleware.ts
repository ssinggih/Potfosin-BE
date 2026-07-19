import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user?: any;
}
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH = 'skipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);

function getPath(req: Request): string {
  return req.originalUrl || req.url || req.path;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  private readonly publicPaths = [
    '/health',
    '/api/v1/health',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
  ];

  private readonly publicGetPrefixes = [
    '/api/v1/projects',
    '/api/v1/techs',
    '/api/v1/uploads',
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    if (this.isPublicPath(req)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      (req as any).user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private isPublicPath(req: Request): boolean {
    const path = getPath(req);
    const method = req.method;

    if (this.publicPaths.some((p) => path === p || path.endsWith(p))) {
      return true;
    }

    if (method === 'GET') {
      if (this.publicGetPrefixes.some((p) => path.startsWith(p))) {
        return true;
      }
    }

    return false;
  }
}
