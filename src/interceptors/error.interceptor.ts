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
import { DateTimeService, LoggerService } from '~@third-party-modules';
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
  constructor(
    private readonly logger: LoggerService,
    private readonly dateTimeService: DateTimeService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<{ url: string }>();
        const response = ctx.getResponse<{ status: (code: number) => void }>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errorName = 'InternalServerError';
        let info: Record<string, unknown> | undefined;
        let stack: string | undefined;

        // Handle custom application errors
        if (error instanceof BaseError) {
          ({
            statusCode: status,
            message,
            name: errorName,
            info,
            stack,
          } = error);
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

        const { url } = request;
        const errorResponseData: ErrorResponse = {
          statusCode: status,
          message,
          error: errorName,
          path: url,
          ...(info && { info }),
        };

        // Log error details with JST timestamp
        const jstTimestamp = this.dateTimeService.jstNow();
        this.logger.error(
          `[${jstTimestamp} JST] Error occurred: ${JSON.stringify(errorResponseData)}`,
          stack,
          'ErrorInterceptor',
        );

        // Set response status
        response.status(status);

        // Return formatted error
        return throwError(() => new HttpException(errorResponseData, status));
      }),
    );
  }
}
