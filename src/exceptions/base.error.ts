import type { HttpStatus } from '@nestjs/common';

export abstract class BaseError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly info?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: HttpStatus,
    info?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.info = info;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
