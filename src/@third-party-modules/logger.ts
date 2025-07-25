import { Global, Injectable, Module } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { NUMBERS } from '~configs';

@Injectable()
export class LoggerService extends PinoLogger {
  log(message: string, context?: string): void {
    if (context) {
      super.info({ context }, message);
    } else {
      super.info(message);
    }
  }

  error(message: string, trace?: string, context?: string): void {
    const errorObj: Record<string, string> = {};
    if (context) errorObj.context = context;
    if (trace) errorObj.trace = trace;

    if (Object.keys(errorObj).length > NUMBERS.ZERO) {
      super.error(errorObj, message);
    } else {
      super.error(message);
    }
  }

  warn(message: string, context?: string): void {
    if (context) {
      super.warn({ context }, message);
    } else {
      super.warn(message);
    }
  }

  debug(message: string, context?: string): void {
    if (context) {
      super.debug({ context }, message);
    } else {
      super.debug(message);
    }
  }

  verbose(message: string, context?: string): void {
    if (context) {
      super.trace({ context }, message);
    } else {
      super.trace(message);
    }
  }
}

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
