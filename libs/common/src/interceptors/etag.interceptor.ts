import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createHash } from 'crypto';
import { Reflector } from '@nestjs/core';
import { CACHE_POLICY } from '../decorators/cache-policy.decorator';

export interface CachePolicyOptions {
  maxAge?: number;
  scope?: 'public' | 'private';
}

const DEFAULT_CACHE_POLICY: CachePolicyOptions = {
  maxAge: 300,
  scope: 'public',
};

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const cachePolicy = this.reflector.get<CachePolicyOptions>(
      CACHE_POLICY,
      context.getHandler(),
    ) || this.reflector.get<CachePolicyOptions>(
      CACHE_POLICY,
      context.getClass(),
    );

    const policy = { ...DEFAULT_CACHE_POLICY, ...cachePolicy };

    if (policy.maxAge === 0) {
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        if (data === null || data === undefined) {
          return;
        }

        const etag = this.generateETag(data);
        const maxAge = policy.maxAge!;
        const cacheControl = `${policy.scope}, max-age=${maxAge}`;

        response.setHeader('ETag', `"${etag}"`);
        response.setHeader('Cache-Control', cacheControl);
        response.setHeader(
          'Last-Modified',
          new Date().toUTCString(),
        );
      }),
    );
  }

  private generateETag(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('md5').update(content).digest('hex');
  }
}
