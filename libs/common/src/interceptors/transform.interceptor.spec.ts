import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should wrap response in standard format', (done) => {
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as any;

    const next = { handle: () => of({ id: '1', name: 'Test' }) };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.statusCode).toBe(200);
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it('should return null data as null', (done) => {
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 204 }),
      }),
    } as any;

    const next = { handle: () => of(null) };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result.data).toBeNull();
      done();
    });
  });
});
