import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '~@third-party-modules';
import { BaseError } from '~exceptions';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  info?: Record<string, unknown>;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<{ url: string }>();
        const response = ctx.getResponse<{ status: (code: number) => void }>();

        const parsedError = this.parseError(error);
        const { url } = request;

        const clientResponse = this.createClientResponse(parsedError, url);
        const detailedResponse = this.createDetailedResponse(parsedError, url);

        this.logError(error, parsedError, detailedResponse, clientResponse);

        response.status(parsedError.status);
        return throwError(
          () => new HttpException(clientResponse, parsedError.status),
        );
      }),
    );
  }

  private parseError(error: unknown): {
    status: number;
    message: string | string[];
    errorName: string;
    info?: Record<string, unknown>;
    stack?: string;
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';
    let info: Record<string, unknown> | undefined;
    let stack: string | undefined;

    // Handle custom application errors
    if (error instanceof BaseError) {
      ({ statusCode: status, message, name: errorName, info, stack } = error);
    }
    // Handle standard HttpException
    else if (error instanceof HttpException) {
      status = error.getStatus();
      const errorResponse = error.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
        errorName = error.constructor.name;
      } else if (typeof errorResponse === 'object') {
        const responseObj = errorResponse as {
          message?: string | string[];
          error?: string;
        };
        message = responseObj.message ?? message;
        errorName = responseObj.error ?? error.constructor.name;
      }
      ({ stack } = error);
    }
    // Handle generic Error
    else if (error instanceof Error) {
      ({ message, name: errorName, stack } = error);
    }

    return { status, message, errorName, info, stack };
  }

  private createClientResponse(
    parsedError: ReturnType<typeof this.parseError>,
    path: string,
  ): ErrorResponse {
    const { status, message, errorName, info } = parsedError;

    // Sanitize response for client (no sensitive details for 5xx errors)
    const SERVER_ERROR_THRESHOLD = 500;
    const sanitizedMessage = status >= SERVER_ERROR_THRESHOLD ? 'Internal server error' : message;

    return {
      statusCode: status,
      message: sanitizedMessage,
      error: status >= SERVER_ERROR_THRESHOLD ? 'InternalServerError' : errorName,
      path,
      // Don't include 'info' for 5xx errors to avoid exposing sensitive data
      ...(status < SERVER_ERROR_THRESHOLD && info && { info }),
    };
  }

  private createDetailedResponse(
    parsedError: ReturnType<typeof this.parseError>,
    path: string,
  ): ErrorResponse {
    const { status, message, errorName, info } = parsedError;

    return {
      statusCode: status,
      message,
      error: errorName,
      path,
      ...(info && { info }),
    };
  }

  private getRootCause(error: unknown): string {
    const originalMessage =
      error instanceof Error ? error.message : String(error);

    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      // Check for common nested error patterns (Drizzle, PostgreSQL, etc.)
      const cause =
        errorObj.cause ??
        errorObj.original ??
        errorObj.detail ??
        errorObj.driverError;

      if (cause && typeof cause === 'object' && 'message' in cause) {
        return String(cause.message);
      } else if (cause && typeof cause === 'string') {
        return cause;
      }
    }

    return originalMessage;
  }

  private getErrorContext(error: unknown): Record<string, unknown> | undefined {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;

      // Only log relevant database error properties
      const context: Record<string, unknown> = {};
      const relevantProps = [
        'code',
        'detail',
        'constraint',
        'table',
        'column',
        'name',
      ];

      for (const prop of relevantProps) {
        if (prop in errorObj && errorObj[prop] != null) {
          context[prop] = errorObj[prop];
        }
      }

      const MIN_CONTEXT_LENGTH = 0;
      return Object.keys(context).length > MIN_CONTEXT_LENGTH ? context : undefined;
    }

    return undefined;
  }

  private logError(
    originalError: unknown,
    parsedError: ReturnType<typeof this.parseError>,
    detailedResponse: ErrorResponse,
    clientResponse: ErrorResponse,
  ): void {
    const rootCause = this.getRootCause(originalError);
    const errorContext = this.getErrorContext(originalError);

    // Single comprehensive log with all relevant information
    const logData = {
      rootCause,
      detailed: detailedResponse,
      client: clientResponse,
      ...(errorContext && { context: errorContext }),
    };

    this.logger.error(
      `${rootCause} | ${JSON.stringify(logData)}`,
      parsedError.stack,
      'ErrorInterceptor',
    );
  }
}
