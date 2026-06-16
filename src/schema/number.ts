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

export interface NumberSchema extends RuntimeSchemaBuilder<
  number,
  'number',
  EmptyRuntimeSchemaOptions,
  RequiredRuntimeSchemaDescriptor<'number', EmptyRuntimeSchemaOptions>
> {}

const numberCodec: RuntimeSchemaCodec<number> = {
  parse(input, context) {
    return parseFiniteNumber(input, context, 'Expected a finite number value.');
  },

  normalize(input, context) {
    return validateFiniteNumber(input, context, 'Expected a finite number value.');
  },

  serialize(input, context) {
    return String(validateFiniteNumber(input, context, 'Expected a finite number value.'));
  },
};

export function number(): NumberSchema {
  return createRuntimeSchemaBuilder<number, 'number'>({
    type: 'number',
    codec: numberCodec,
    validateDefault(value, context) {
      validateNumberDefault(value, context);
    },
  });
}

function parseFiniteNumber(
  input: string,
  context: RuntimeSchemaValueContext,
  message: string,
): number {
  if (!input.trim()) {
    throw createSchemaValueError(context.errorCode, message, context.path);
  }

  return validateFiniteNumber(Number(input), context, message);
}

function validateFiniteNumber(
  input: unknown,
  context: RuntimeSchemaValueContext,
  message: string,
): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }

  throw createSchemaValueError(context.errorCode, message, context.path);
}

function validateNumberDefault(value: number, context: RuntimeDefaultValidationContext): void {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'Number schema default must be a finite number.', {
    path: context.path,
  });
}
