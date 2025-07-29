import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class DomainError extends BaseError {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    info?: Record<string, unknown>,
  ) {
    super(message, statusCode, info);
    this.name = 'DomainError';
  }

  static badRequest(
    message: string,
    info?: Record<string, unknown>,
  ): DomainError {
    return new DomainError(message, HttpStatus.BAD_REQUEST, info);
  }

  static notFound(
    message: string,
    info?: Record<string, unknown>,
  ): DomainError {
    return new DomainError(message, HttpStatus.NOT_FOUND, info);
  }

  static conflict(
    message: string,
    info?: Record<string, unknown>,
  ): DomainError {
    return new DomainError(message, HttpStatus.CONFLICT, info);
  }

  static unprocessableEntity(
    message: string,
    info?: Record<string, unknown>,
  ): DomainError {
    return new DomainError(message, HttpStatus.UNPROCESSABLE_ENTITY, info);
  }

  static internalServerError(
    message: string,
    info?: Record<string, unknown>,
  ): DomainError {
    return new DomainError(message, HttpStatus.INTERNAL_SERVER_ERROR, info);
  }
}
