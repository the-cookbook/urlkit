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

export interface StringSchema extends RuntimeSchemaBuilder<
  string,
  'string',
  EmptyRuntimeSchemaOptions,
  RequiredRuntimeSchemaDescriptor<'string', EmptyRuntimeSchemaOptions>
> {}

const stringCodec: RuntimeSchemaCodec<string> = {
  parse(input, context) {
    return validateString(input, context, 'Expected a string value.');
  },

  normalize(input, context) {
    return validateString(input, context, 'Expected a string value.');
  },

  serialize(input, context) {
    return validateString(input, context, 'Expected a string value.');
  },
};

export function string(): StringSchema {
  return createRuntimeSchemaBuilder<string, 'string'>({
    type: 'string',
    codec: stringCodec,
    validateDefault(value, context) {
      validateStringDefault(value, context);
    },
  });
}

function validateString(
  input: unknown,
  context: RuntimeSchemaValueContext,
  message: string,
): string {
  if (typeof input === 'string') {
    return input;
  }

  throw createSchemaValueError(context.errorCode, message, context.path);
}

function validateStringDefault(value: string, context: RuntimeDefaultValidationContext): void {
  if (typeof value === 'string') {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'String schema default must be a string.', {
    path: context.path,
  });
}
