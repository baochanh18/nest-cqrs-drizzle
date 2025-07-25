import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodTypeDef } from 'zod';

@Injectable()
export class ZodValidationPipe<
  TInput = unknown,
  TOutput = TInput,
  TDef extends ZodTypeDef = ZodTypeDef,
> implements PipeTransform<TInput, TOutput>
{
  constructor(private readonly schema: ZodSchema<TOutput, TDef, TInput>) {}

  transform(value: TInput): TOutput {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    return result.data;
  }
}
