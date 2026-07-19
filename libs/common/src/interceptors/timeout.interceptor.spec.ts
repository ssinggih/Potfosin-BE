import { of, throwError, Subject } from 'rxjs';
import { RequestTimeoutException } from '@nestjs/common';
import { TimeoutInterceptor } from './timeout.interceptor';

describe('TimeoutInterceptor', () => {
  it('should pass through if response is fast', (done) => {
    const interceptor = new TimeoutInterceptor(5000);
    const context = {} as any;
    const next = { handle: () => of('data') };

    interceptor.intercept(context, next).subscribe((data: any) => {
      expect(data).toBe('data');
      done();
    });
  });

  it('should throw RequestTimeoutException on timeout', (done) => {
    const interceptor = new TimeoutInterceptor(1);
    const context = {} as any;
    const next = { handle: () => new Subject() };

    interceptor.intercept(context, next).subscribe({
      error: (err: any) => {
        expect(err).toBeInstanceOf(RequestTimeoutException);
        expect(err.message).toContain('timed out');
        done();
      },
    });
  });

  it('should rethrow non-timeout errors', (done) => {
    const interceptor = new TimeoutInterceptor(5000);
    const context = {} as any;
    const next = { handle: () => throwError(() => new Error('other error')) };

    interceptor.intercept(context, next).subscribe({
      error: (err: any) => {
        expect(err.message).toBe('other error');
        done();
      },
    });
  });
});
