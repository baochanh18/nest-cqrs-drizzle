import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class UseCaseError extends BaseError {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    info?: Record<string, unknown>,
  ) {
    super(message, statusCode, info);
    this.name = 'UseCaseError';
  }

  static badRequest(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.BAD_REQUEST, info);
  }

  static unauthorized(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.UNAUTHORIZED, info);
  }

  static forbidden(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.FORBIDDEN, info);
  }

  static notFound(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.NOT_FOUND, info);
  }

  static conflict(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.CONFLICT, info);
  }

  static unprocessableEntity(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.UNPROCESSABLE_ENTITY, info);
  }

  static internalServerError(
    message: string,
    info?: Record<string, unknown>,
  ): UseCaseError {
    return new UseCaseError(message, HttpStatus.INTERNAL_SERVER_ERROR, info);
  }
}
