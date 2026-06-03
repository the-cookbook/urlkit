import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  RequiredRuntimeSchemaDescriptor,
  RuntimeDefaultValidationContext,
  RuntimeSchemaBuilder,
  RuntimeSchemaCodec,
  RuntimeSchemaOptions,
  RuntimeSchemaValueContext,
} from './contracts.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { createSchemaValueError } from './create-schema-value-error.js';

export interface EnumSchemaOptions<Values extends readonly string[]> extends RuntimeSchemaOptions {
  readonly values: Values;
}

export interface EnumSchema<Values extends readonly string[]> extends RuntimeSchemaBuilder<
  Values[number],
  'enum',
  EnumSchemaOptions<Values>,
  RequiredRuntimeSchemaDescriptor<'enum', EnumSchemaOptions<Values>>
> {}

export function enumOf<const Values extends readonly string[]>(values: Values): EnumSchema<Values> {
  const normalizedValues = normalizeEnumValues(values);
  const allowedValues = new Set<string>(normalizedValues);
  const expectedMessage = createExpectedEnumMessage(normalizedValues);

  const enumCodec: RuntimeSchemaCodec<Values[number]> = {
    parse(input, context) {
      return validateEnumValue(input, allowedValues, expectedMessage, context);
    },

    normalize(input, context) {
      return validateEnumValue(input, allowedValues, expectedMessage, context);
    },

    serialize(input, context) {
      return validateEnumValue(input, allowedValues, expectedMessage, context);
    },
  };

  return createRuntimeSchemaBuilder<Values[number], 'enum', EnumSchemaOptions<Values>>({
    kind: 'enum',
    options: {
      values: normalizedValues as unknown as Values,
    },
    codec: enumCodec,
    validateDefault(value, context) {
      validateEnumDefault(value, allowedValues, expectedMessage, context);
    },
  });
}

function normalizeEnumValues<Values extends readonly string[]>(values: Values): readonly string[] {
  if (!Array.isArray(values)) {
    throw new UrlKitError('invalid-descriptor', 'Enum schema values must be an array.');
  }

  if (!values.length) {
    throw new UrlKitError('invalid-descriptor', 'Enum schema values must not be empty.');
  }

  for (const value of values) {
    if (typeof value !== 'string') {
      throw new UrlKitError('invalid-descriptor', 'Enum schema values must be strings.');
    }
  }

  return Object.freeze([...values]);
}

function validateEnumValue(
  input: unknown,
  allowedValues: ReadonlySet<string>,
  message: string,
  context: RuntimeSchemaValueContext,
): string {
  if (typeof input === 'string' && allowedValues.has(input)) {
    return input;
  }

  throw createSchemaValueError(context.errorCode, message, context.path);
}

function validateEnumDefault(
  value: string,
  allowedValues: ReadonlySet<string>,
  message: string,
  context: RuntimeDefaultValidationContext,
): void {
  if (typeof value === 'string' && allowedValues.has(value)) {
    return;
  }

  throw new UrlKitError('invalid-descriptor', `Enum schema default is invalid. ${message}`, {
    path: context.path,
  });
}

function createExpectedEnumMessage(values: readonly string[]): string {
  return `Expected one of: ${values.join(', ')}.`;
}
