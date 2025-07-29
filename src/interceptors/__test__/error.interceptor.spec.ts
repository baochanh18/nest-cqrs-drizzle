/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { DateTimeService, LoggerService } from '~@third-party-modules';
import { NUMBERS } from '~configs';
import {
  DomainError,
  InfrastructureError,
  PresentationError,
  UseCaseError,
} from '~exceptions';
import { ErrorInterceptor } from '../error.interceptor';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let loggerService: {
    error: jest.Mock;
    log: jest.Mock;
    warn: jest.Mock;
    debug: jest.Mock;
    verbose: jest.Mock;
  };
  let module: TestingModule;

  // Mock objects for testing
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  const mockRequest = { url: '/test-endpoint' };
  const mockResponse = { status: jest.fn() };

  beforeAll(async () => {
    // Create testing module
    module = await Test.createTestingModule({
      providers: [
        ErrorInterceptor,
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
        {
          provide: DateTimeService,
          useValue: {
            now: jest.fn().mockReturnValue('2024-01-01T00:00:00.000Z'),
            utcNow: jest.fn().mockReturnValue('2024-01-01T00:00:00.000Z'),
            jstNow: jest.fn().mockReturnValue('2024-01-01 09:00:00'),
            toJST: jest.fn().mockReturnValue('2024-01-01 09:00:00'),
            toISOString: jest.fn().mockReturnValue('2024-01-01T00:00:00.000Z'),
            format: jest.fn().mockReturnValue('2024-01-01 00:00:00'),
            formatJST: jest.fn().mockReturnValue('2024-01-01 09:00:00'),
          },
        },
      ],
    }).compile();

    interceptor = module.get<ErrorInterceptor>(ErrorInterceptor);
    loggerService = module.get(LoggerService);

    // Setup mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('successful responses', () => {
    let successResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const testData = { message: 'success' };
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(testData)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: (value) => {
            successResult = {
              value,
              loggerCalled: loggerService.error.mock.calls.length,
            };
            resolve();
          },
          error: () => {
            resolve();
          },
        });
      });
    });

    it('should pass through successful responses', () => {
      expect(successResult.value).toEqual({ message: 'success' });
      expect(successResult.loggerCalled).toBe(NUMBERS.ZERO);
    });
  });

  describe('HttpException handling', () => {
    let httpExceptionResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const errorMessage = 'Bad Request';
      const httpException = new HttpException(
        errorMessage,
        HttpStatus.BAD_REQUEST,
      );
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => httpException)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            httpExceptionResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
              loggerCalled:
                loggerService.error.mock.calls.length > NUMBERS.ZERO,
            };
            resolve();
          },
        });
      });
    });

    it('should handle HttpException correctly', () => {
      expect(httpExceptionResult.isHttpException).toBe(true);
      expect(httpExceptionResult.status).toBe(HttpStatus.BAD_REQUEST);
      expect(httpExceptionResult.response).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        error: 'HttpException',
        path: '/test-endpoint',
      });
      expect(httpExceptionResult.statusCalledWith).toBe(HttpStatus.BAD_REQUEST);
      expect(httpExceptionResult.loggerCalled).toBe(true);
    });
  });

  describe('HttpException with object response', () => {
    let httpExceptionWithObjectResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const errorResponse = {
        message: ['Field is required', 'Field must be string'],
        error: 'ValidationError',
      };
      const httpExceptionWithObject = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );
      mockCallHandler = {
        handle: jest
          .fn()
          .mockReturnValue(throwError(() => httpExceptionWithObject)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            httpExceptionWithObjectResult = {
              isHttpException: error instanceof HttpException,
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle HttpException with object response', () => {
      expect(httpExceptionWithObjectResult.isHttpException).toBe(true);
      expect(httpExceptionWithObjectResult.response).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Field is required', 'Field must be string'],
        error: 'ValidationError',
        path: '/test-endpoint',
      });
      expect(httpExceptionWithObjectResult.statusCalledWith).toBe(
        HttpStatus.BAD_REQUEST,
      );
    });
  });

  describe('generic Error handling', () => {
    let genericErrorResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const genericError = new Error('Something went wrong');
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => genericError)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            genericErrorResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle generic Error', () => {
      expect(genericErrorResult.isHttpException).toBe(true);
      expect(genericErrorResult.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(genericErrorResult.response).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        error: 'Error',
        path: '/test-endpoint',
      });
      expect(genericErrorResult.statusCalledWith).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('unknown error types', () => {
    let unknownErrorResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const unknownError = 'string error';
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => unknownError)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            unknownErrorResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle unknown error types', () => {
      expect(unknownErrorResult.isHttpException).toBe(true);
      expect(unknownErrorResult.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(unknownErrorResult.response).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
        path: '/test-endpoint',
      });
      expect(unknownErrorResult.statusCalledWith).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('error logging with stack trace', () => {
    let errorWithStackResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const errorWithStack = new Error('Test error');
      errorWithStack.stack = 'Error: Test error\\n    at TestFile.js:123';
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => errorWithStack)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            errorWithStackResult = {
              loggerCalledWith: loggerService.error.mock.calls[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should log errors with stack trace when available', () => {
      expect(errorWithStackResult.loggerCalledWith[NUMBERS.ZERO]).toMatch(
        /Error occurred:/,
      );
      expect(errorWithStackResult.loggerCalledWith[NUMBERS.ONE]).toBe(
        'Error: Test error\\n    at TestFile.js:123',
      );
      expect(errorWithStackResult.loggerCalledWith[NUMBERS.TWO]).toBe(
        'ErrorInterceptor',
      );
    });
  });

  describe('DomainError handling', () => {
    let domainErrorResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const domainError = DomainError.notFound('User not found', {
        userId: 123,
      });
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => domainError)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            domainErrorResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle DomainError with proper status and info', () => {
      expect(domainErrorResult.isHttpException).toBe(true);
      expect(domainErrorResult.status).toBe(HttpStatus.NOT_FOUND);
      expect(domainErrorResult.response).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: 'DomainError',
        path: '/test-endpoint',
        info: { userId: 123 },
      });
      expect(domainErrorResult.statusCalledWith).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('UseCaseError handling', () => {
    let useCaseErrorResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const useCaseError = UseCaseError.badRequest('Invalid input', {
        field: 'email',
        value: 'invalid-email',
      });
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => useCaseError)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            useCaseErrorResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle UseCaseError with proper status and info', () => {
      expect(useCaseErrorResult.isHttpException).toBe(true);
      expect(useCaseErrorResult.status).toBe(HttpStatus.BAD_REQUEST);
      expect(useCaseErrorResult.response).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
        error: 'UseCaseError',
        path: '/test-endpoint',
        info: { field: 'email', value: 'invalid-email' },
      });
      expect(useCaseErrorResult.statusCalledWith).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PresentationError handling', () => {
    let presentationErrorResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const presentationError = PresentationError.conflict(
        'Resource already exists',
      );
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => presentationError)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            presentationErrorResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle PresentationError correctly', () => {
      expect(presentationErrorResult.isHttpException).toBe(true);
      expect(presentationErrorResult.status).toBe(HttpStatus.CONFLICT);
      expect(presentationErrorResult.response).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'Resource already exists',
        error: 'PresentationError',
        path: '/test-endpoint',
      });
      expect(presentationErrorResult.statusCalledWith).toBe(
        HttpStatus.CONFLICT,
      );
    });
  });

  describe('InfrastructureError handling', () => {
    let infrastructureErrorResult: any;

    beforeAll(async () => {
      jest.clearAllMocks();
      mockResponse.status.mockClear();

      const infrastructureError = InfrastructureError.serviceUnavailable(
        'Database connection failed',
        { service: 'postgres' },
      );
      mockCallHandler = {
        handle: jest
          .fn()
          .mockReturnValue(throwError(() => infrastructureError)),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error: unknown) => {
            const httpError = error as HttpException;
            infrastructureErrorResult = {
              isHttpException: error instanceof HttpException,
              status: httpError.getStatus(),
              response: httpError.getResponse(),
              statusCalledWith:
                mockResponse.status.mock.calls[NUMBERS.ZERO]?.[NUMBERS.ZERO],
            };
            resolve();
          },
        });
      });
    });

    it('should handle InfrastructureError with proper status and info', () => {
      expect(infrastructureErrorResult.isHttpException).toBe(true);
      expect(infrastructureErrorResult.status).toBe(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(infrastructureErrorResult.response).toEqual({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection failed',
        error: 'InfrastructureError',
        path: '/test-endpoint',
        info: { service: 'postgres' },
      });
      expect(infrastructureErrorResult.statusCalledWith).toBe(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  });
});
