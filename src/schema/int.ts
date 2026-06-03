import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  EmptyRuntimeSchemaOptions,
  RequiredRuntimeSchemaDescriptor,
  RuntimeDefaultValidationContext,
  RuntimeSchemaBuilder,
  RuntimeSchemaCodec,
  RuntimeSchemaValueContext,
} from './contracts.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { createSchemaValueError } from './create-schema-value-error.js';

export interface IntSchema extends RuntimeSchemaBuilder<
  number,
  'int',
  EmptyRuntimeSchemaOptions,
  RequiredRuntimeSchemaDescriptor<'int', EmptyRuntimeSchemaOptions>
> {}

const intCodec: RuntimeSchemaCodec<number> = {
  parse(input, context) {
    return parseFiniteInteger(input, context, 'Expected a finite integer value.');
  },

  normalize(input, context) {
    return validateFiniteInteger(input, context, 'Expected a finite integer value.');
  },

  serialize(input, context) {
    return String(validateFiniteInteger(input, context, 'Expected a finite integer value.'));
  },
};

export function int(): IntSchema {
  return createRuntimeSchemaBuilder<number, 'int'>({
    kind: 'int',
    codec: intCodec,
    validateDefault(value, context) {
      validateIntDefault(value, context);
    },
  });
}

function parseFiniteInteger(
  input: string,
  context: RuntimeSchemaValueContext,
  message: string,
): number {
  if (!input.trim()) {
    throw createSchemaValueError(context.errorCode, message, context.path);
  }

  return validateFiniteInteger(Number(input), context, message);
}

function validateFiniteInteger(
  input: unknown,
  context: RuntimeSchemaValueContext,
  message: string,
): number {
  if (typeof input === 'number' && Number.isInteger(input)) {
    return input;
  }

  throw createSchemaValueError(context.errorCode, message, context.path);
}

function validateIntDefault(value: number, context: RuntimeDefaultValidationContext): void {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'Integer schema default must be a finite integer.', {
    path: context.path,
  });
}
