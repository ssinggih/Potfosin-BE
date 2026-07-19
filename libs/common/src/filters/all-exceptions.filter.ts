import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        errors = resp.errors || null;

        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          errors = resp.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errObj = exception as any;
    if (errObj?.message && errObj?.status) {
      message = errObj.message;
      status = errObj.status;
    }

    this.logger.error(`[${request.method}] ${request.url} → ${status}: ${message}`);

    const errorResponse: Record<string, any> = {
      success: false,
      message,
      errors,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.trace =
        exception instanceof Error ? exception.stack
        : typeof exception === 'object' ? JSON.stringify(exception)
        : String(exception);
    }

    response.status(status).json(errorResponse);
  }
}
