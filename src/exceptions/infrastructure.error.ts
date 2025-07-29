import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class InfrastructureError extends BaseError {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    info?: Record<string, unknown>,
  ) {
    super(message, statusCode, info);
    this.name = 'InfrastructureError';
  }

  static badRequest(
    message: string,
    info?: Record<string, unknown>,
  ): InfrastructureError {
    return new InfrastructureError(message, HttpStatus.BAD_REQUEST, info);
  }

  static notFound(
    message: string,
    info?: Record<string, unknown>,
  ): InfrastructureError {
    return new InfrastructureError(message, HttpStatus.NOT_FOUND, info);
  }

  static conflict(
    message: string,
    info?: Record<string, unknown>,
  ): InfrastructureError {
    return new InfrastructureError(message, HttpStatus.CONFLICT, info);
  }

  static internalServerError(
    message: string,
    info?: Record<string, unknown>,
  ): InfrastructureError {
    return new InfrastructureError(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      info,
    );
  }

  static serviceUnavailable(
    message: string,
    info?: Record<string, unknown>,
  ): InfrastructureError {
    return new InfrastructureError(
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      info,
    );
  }
}
