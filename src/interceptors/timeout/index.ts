import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { LoggerService } from '~@third-party-modules';
import { NUMBERS } from '~configs';

interface TimeoutConfig {
  defaultTimeoutMs?: number;
  maxTimeoutMs?: number;
  customMessage?: string;
}

interface RequestWithHeaders {
  url: string;
  headers: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const MAX_TIMEOUT_MS = 300000; // 5 minutes

/**
 * Interceptor that adds a timeout to all HTTP requests
 * If a request takes longer than the specified timeout, it will throw a RequestTimeoutException
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeoutMs: number;
  private readonly maxTimeoutMs: number;
  private readonly customMessage?: string;

  constructor(
    private readonly logger: LoggerService,
    config?: TimeoutConfig,
  ) {
    this.defaultTimeoutMs = config?.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxTimeoutMs = config?.maxTimeoutMs ?? MAX_TIMEOUT_MS;
    this.customMessage = config?.customMessage;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithHeaders>();

    // Allow custom timeout from header
    const customTimeout = this.getCustomTimeout(request.headers);
    const timeoutMs = Math.min(
      customTimeout ?? this.defaultTimeoutMs,
      this.maxTimeoutMs,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          const duration = Date.now() - startTime;
          const errorMessage =
            this.customMessage ?? `Request timeout after ${timeoutMs}ms`;

          this.logTimeout(request.url, duration, timeoutMs);

          return throwError(() => new RequestTimeoutException(errorMessage));
        }
        return throwError(() => err);
      }),
    );
  }

  private getCustomTimeout(
    headers: Record<string, string>,
  ): number | undefined {
    const timeoutHeader = headers['x-request-timeout'];
    if (timeoutHeader) {
      const parsed = parseInt(timeoutHeader, 10);
      if (!isNaN(parsed) && parsed > NUMBERS.ZERO) {
        return parsed;
      }
    }
    return undefined;
  }

  private logTimeout(url: string, duration: number, timeoutMs: number): void {
    const logData = {
      url,
      duration,
      timeoutMs,
      exceeded: duration - timeoutMs,
    };

    this.logger.warn(
      `Request timeout: ${JSON.stringify(logData)}`,
      'TimeoutInterceptor',
    );
  }
}
