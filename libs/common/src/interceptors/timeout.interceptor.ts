import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000;

  constructor(private readonly timeoutMs?: number) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const duration = this.timeoutMs || this.defaultTimeout;

    return next.handle().pipe(
      timeout(duration),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timed out after ${duration}ms`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
