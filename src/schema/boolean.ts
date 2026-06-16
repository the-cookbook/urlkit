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

export interface BooleanSchema extends RuntimeSchemaBuilder<
  boolean,
  'boolean',
  EmptyRuntimeSchemaOptions,
  RequiredRuntimeSchemaDescriptor<'boolean', EmptyRuntimeSchemaOptions>
> {}

const booleanCodec: RuntimeSchemaCodec<boolean> = {
  parse(input, context) {
    if (input === 'true') {
      return true;
    }

    if (input === 'false') {
      return false;
    }

    throw createSchemaValueError(context.errorCode, 'Expected "true" or "false".', context.path);
  },

  normalize(input, context) {
    return validateBoolean(input, context);
  },

  serialize(input, context) {
    return validateBoolean(input, context) ? 'true' : 'false';
  },
};

export function boolean(): BooleanSchema {
  return createRuntimeSchemaBuilder<boolean, 'boolean'>({
    type: 'boolean',
    codec: booleanCodec,
    validateDefault(value, context) {
      validateBooleanDefault(value, context);
    },
  });
}

function validateBoolean(input: unknown, context: RuntimeSchemaValueContext): boolean {
  if (typeof input === 'boolean') {
    return input;
  }

  throw createSchemaValueError(context.errorCode, 'Expected a boolean value.', context.path);
}

function validateBooleanDefault(value: boolean, context: RuntimeDefaultValidationContext): void {
  if (typeof value === 'boolean') {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'Boolean schema default must be a boolean.', {
    path: context.path,
  });
}
