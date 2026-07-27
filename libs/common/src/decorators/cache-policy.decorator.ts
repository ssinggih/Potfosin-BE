import { SetMetadata } from '@nestjs/common';
import { CachePolicyOptions } from '../interceptors/etag.interceptor';

export const CACHE_POLICY = 'cachePolicy';

export const CachePolicy = (options: CachePolicyOptions) =>
  SetMetadata(CACHE_POLICY, options);
