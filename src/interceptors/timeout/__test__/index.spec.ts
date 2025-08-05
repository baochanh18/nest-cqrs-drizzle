import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { RequestTimeoutException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoggerService, testingModule } from '~@third-party-modules';
import { NUMBERS } from '~configs';
import { TimeoutInterceptor } from '../index';

const DELAY_MS_LONG = 100;
const TIMEOUT_MS_VERY_SHORT = 50;
const TIMEOUT_MS_SHORT = 75;
const TIMEOUT_MS_MEDIUM = 200;
const TIMEOUT_MS_LONG = 30000;
const TIMEOUT_MS_MAX = 60000;
const TIMEOUT_MS_EXCEED_MAX = 120000;
const TIMEOUT_HEADER_KEY = 'x-request-timeout';

interface MockRequest {
  url: string;
  headers: Record<string, string>;
}

interface MockResponse {
  status: (code: number) => void;
}

interface MockHttpContext {
  getRequest: () => MockRequest;
  getResponse: () => MockResponse;
  getNext: () => Record<string, unknown>;
}

interface TestResult {
  message: string;
}

type TestError = Error | RequestTimeoutException;

describe('TimeoutInterceptor Unit Test', () => {
  let interceptor: TimeoutInterceptor;
  let logger: LoggerService;
  let module: TestingModule;

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
  ): ExecutionContext =>
    ({
      switchToHttp: (): MockHttpContext => ({
        getRequest: () => ({
          url: '/test-endpoint',
          headers,
        }),
        getResponse: () => ({
          status: jest.fn(),
        }),
        getNext: () => ({}),
      }),
      getClass: () => ({}),
      getHandler: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({}),
      switchToWs: () => ({}),
      getType: () => 'http',
    }) as unknown as ExecutionContext;

  const mockExecutionContext = createMockExecutionContext();

  const mockCallHandler: CallHandler & { handle: jest.Mock } = {
    handle: jest.fn(),
  };

  beforeAll(async () => {
    module = await testingModule([LoggerService]);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  describe('successful request within timeout', () => {
    let result: TestResult | undefined;
    let error: TestError | undefined;

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup
      interceptor = new TimeoutInterceptor(logger);
      const testData: TestResult = { message: 'success' };
      mockCallHandler.handle = jest.fn(() => of(testData));

      // Execute
      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: (value) => {
            result = value as TestResult;
            resolve();
          },
          error: (err: TestError) => {
            error = err;
            resolve();
          },
        });
      });
    });

    it('should pass through the response data', () => {
      // Assert
      expect(result).toEqual({ message: 'success' });
    });

    it('should not throw any error', () => {
      // Assert
      expect(error).toBeUndefined();
    });

    it('should call the handler', () => {
      // Assert
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });
  });

  describe('request exceeds timeout', () => {
    let error: TestError | undefined;
    let warnSpy: jest.SpyInstance;

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup
      interceptor = new TimeoutInterceptor(logger, {
        defaultTimeoutMs: TIMEOUT_MS_VERY_SHORT,
      });
      warnSpy = jest.spyOn(logger, 'warn');

      // Mock delayed response
      mockCallHandler.handle = jest.fn(() =>
        of({ message: 'delayed' }).pipe(delay(DELAY_MS_LONG)),
      );

      // Execute
      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: () => {
            resolve();
          },
          error: (err: TestError) => {
            error = err;
            resolve();
          },
        });
      });
    });

    it('should throw RequestTimeoutException', () => {
      // Assert
      expect(error).toBeInstanceOf(RequestTimeoutException);
    });

    it('should have correct error message', () => {
      // Assert
      expect(error?.message).toBe(
        `Request timeout after ${TIMEOUT_MS_VERY_SHORT}ms`,
      );
    });

    it('should log timeout warning', () => {
      // Assert
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request timeout:'),
        'TimeoutInterceptor',
      );
    });
  });

  describe('custom timeout message', () => {
    let error: TestError | undefined;
    const customMessage = 'Custom timeout error';

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup
      interceptor = new TimeoutInterceptor(logger, {
        defaultTimeoutMs: TIMEOUT_MS_VERY_SHORT,
        customMessage,
      });

      // Mock delayed response
      mockCallHandler.handle = jest.fn(() =>
        of({ message: 'delayed' }).pipe(delay(DELAY_MS_LONG)),
      );

      // Execute
      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: () => {
            resolve();
          },
          error: (err: TestError) => {
            error = err;
            resolve();
          },
        });
      });
    });

    it('should use custom timeout message', () => {
      // Assert
      expect(error?.message).toBe(customMessage);
    });
  });

  describe('custom timeout header', () => {
    let error: TestError | undefined;

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup context with custom header
      const timeoutHeaders = { [TIMEOUT_HEADER_KEY]: String(TIMEOUT_MS_SHORT) };
      const contextWithHeader = createMockExecutionContext(timeoutHeaders);

      interceptor = new TimeoutInterceptor(logger, {
        defaultTimeoutMs: TIMEOUT_MS_MEDIUM,
      });

      // Mock delayed response
      mockCallHandler.handle = jest.fn(() =>
        of({ message: 'delayed' }).pipe(delay(DELAY_MS_LONG)),
      );

      // Execute
      await new Promise<void>((resolve) => {
        interceptor.intercept(contextWithHeader, mockCallHandler).subscribe({
          next: () => {
            resolve();
          },
          error: (err: TestError) => {
            error = err;
            resolve();
          },
        });
      });
    });

    it('should use timeout from header', () => {
      // Assert
      expect(error).toBeInstanceOf(RequestTimeoutException);
      expect(error?.message).toBe(
        `Request timeout after ${TIMEOUT_MS_SHORT}ms`,
      );
    });
  });

  describe('maximum timeout limit', () => {
    let result: TestResult | undefined;
    let interceptorWithMaxLimit: TimeoutInterceptor;

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup context with header exceeding max timeout
      const largeTimeoutHeaders = {
        [TIMEOUT_HEADER_KEY]: String(TIMEOUT_MS_EXCEED_MAX),
      };
      const contextWithLargeTimeout =
        createMockExecutionContext(largeTimeoutHeaders);

      interceptorWithMaxLimit = new TimeoutInterceptor(logger, {
        defaultTimeoutMs: TIMEOUT_MS_LONG,
        maxTimeoutMs: TIMEOUT_MS_MAX,
      });

      // Mock quick response
      mockCallHandler.handle = jest.fn(() => of({ message: 'success' }));

      // Execute
      await new Promise<void>((resolve) => {
        interceptorWithMaxLimit
          .intercept(contextWithLargeTimeout, mockCallHandler)
          .subscribe({
            next: (value) => {
              result = value as TestResult;
              resolve();
            },
            error: () => {
              resolve();
            },
          });
      });
    });

    it('should respect maximum timeout limit', () => {
      // Assert - should complete successfully within max timeout
      expect(result).toEqual({ message: 'success' });
    });
  });

  describe('invalid timeout header values', () => {
    let result: TestResult | undefined;

    interface InvalidHeaderCase {
      description: string;
      headers: Record<string, string>;
    }

    const invalidHeaderCases: InvalidHeaderCase[] = [
      {
        description: 'non-numeric value',
        headers: {
          [TIMEOUT_HEADER_KEY]: 'invalid',
        },
      },
      {
        description: 'negative value',
        headers: {
          [TIMEOUT_HEADER_KEY]: String(-DELAY_MS_LONG),
        },
      },
      {
        description: 'zero value',
        headers: {
          [TIMEOUT_HEADER_KEY]: String(NUMBERS.ZERO),
        },
      },
    ];

    invalidHeaderCases.forEach(({ description, headers }) => {
      describe(`with ${description}`, () => {
        beforeAll(async () => {
          // Clear previous mocks
          jest.clearAllMocks();

          // Setup context with invalid header
          const contextWithInvalidHeader = createMockExecutionContext(headers);

          interceptor = new TimeoutInterceptor(logger);

          // Mock quick response
          mockCallHandler.handle = jest.fn(() => of({ message: 'success' }));

          // Execute
          await new Promise<void>((resolve) => {
            interceptor
              .intercept(contextWithInvalidHeader, mockCallHandler)
              .subscribe({
                next: (value) => {
                  result = value as TestResult;
                  resolve();
                },
                error: () => {
                  resolve();
                },
              });
          });
        });

        it('should ignore invalid header and use default timeout', () => {
          // Assert
          expect(result).toEqual({ message: 'success' });
        });
      });
    });
  });

  describe('non-timeout errors', () => {
    let error: TestError | undefined;
    const testError = new Error('Test error');

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup
      interceptor = new TimeoutInterceptor(logger);
      mockCallHandler.handle = jest.fn(() => throwError(() => testError));

      // Execute
      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: () => {
            resolve();
          },
          error: (err: TestError) => {
            error = err;
            resolve();
          },
        });
      });
    });

    it('should pass through other errors without modification', () => {
      // Assert
      expect(error).toBe(testError);
    });

    it('should not convert to RequestTimeoutException', () => {
      // Assert
      expect(error).not.toBeInstanceOf(RequestTimeoutException);
    });

    it('should preserve original error message', () => {
      // Assert
      expect(error?.message).toBe('Test error');
    });
  });
});
