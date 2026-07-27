import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  etag: string;
  expiry: number;
  maxAge: number;
}

@Injectable()
export class HttpCacheMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpCacheMiddleware.name);
  private readonly etagStore = new Map<string, CacheEntry>();
  private readonly MAX_ENTRIES = 200;
  private readonly DEFAULT_MAX_AGE = 300;

  use(req: Request, res: Response, next: NextFunction): void {
    if (req.method !== 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      return next();
    }

    const url = this.normalizeUrl(req);
    const ifNoneMatch = req.headers['if-none-match'];

    if (ifNoneMatch) {
      const entry = this.etagStore.get(url);

      if (entry && entry.etag === ifNoneMatch && Date.now() < entry.expiry) {
        this.logger.debug(`304 Not Modified: ${url}`);
        res.status(304).end();
        return;
      }
    }

    this.cleanupExpired();

    res.on('finish', () => {
      if (res.statusCode === 200) {
        const etag = res.getHeader('ETag') as string | undefined;
        const cacheControl = res.getHeader('Cache-Control') as string | undefined;

        if (etag && cacheControl && !cacheControl.includes('no-store')) {
          const maxAge = this.parseMaxAge(cacheControl);
          this.storeEtag(url, etag, maxAge);
        }
      }
    });

    next();
  }

  storeEtag(url: string, etag: string, maxAge: number): void {
    if (this.etagStore.size >= this.MAX_ENTRIES) {
      this.evictOldest();
    }

    this.etagStore.set(url, {
      etag,
      expiry: Date.now() + maxAge * 1000,
      maxAge,
    });
  }

  getEtag(url: string): string | undefined {
    const entry = this.etagStore.get(url);
    if (!entry || Date.now() >= entry.expiry) {
      this.etagStore.delete(url);
      return undefined;
    }
    return entry.etag;
  }

  evict(pattern?: string): void {
    if (!pattern) {
      this.etagStore.clear();
      return;
    }

    for (const key of this.etagStore.keys()) {
      if (key.includes(pattern)) {
        this.etagStore.delete(key);
      }
    }
  }

  private normalizeUrl(req: Request): string {
    const url = new URL(req.originalUrl || req.url, `http://${req.headers.host || 'localhost'}`);
    const sortedParams = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    return `${url.pathname}?${sortedParams.map(([k, v]) => `${k}=${v}`).join('&')}`;
  }

  private parseMaxAge(cacheControl: string): number {
    const match = cacheControl.match(/max-age=(\d+)/);
    return match ? parseInt(match[1], 10) : this.DEFAULT_MAX_AGE;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.etagStore) {
      if (now >= entry.expiry) {
        this.etagStore.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestExpiry = Infinity;

    for (const [key, entry] of this.etagStore) {
      if (entry.expiry < oldestExpiry) {
        oldestExpiry = entry.expiry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.etagStore.delete(oldestKey);
    }
  }
}
