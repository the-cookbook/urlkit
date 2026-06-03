import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
  RuntimeSchemaSafeResult,
  RuntimeSchemaValueOptions,
} from './contracts.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

export function safeParseRuntimeSchemaValue<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): RuntimeSchemaSafeResult<Value> {
  try {
    return { success: true, data: parseRuntimeSchemaValue(schema, input, options) };
  } catch (error) {
    return { success: false, error: toUrlKitError(error) };
  }
}

export function safeNormalizeRuntimeSchemaValue<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): RuntimeSchemaSafeResult<Value> {
  try {
    return { success: true, data: normalizeRuntimeSchemaValue(schema, input, options) };
  } catch (error) {
    return { success: false, error: toUrlKitError(error) };
  }
}

export function safeSerializeRuntimeSchemaValue<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): RuntimeSchemaSafeResult<string | undefined> {
  try {
    return { success: true, data: serializeRuntimeSchemaValue(schema, input, options) };
  } catch (error) {
    return { success: false, error: toUrlKitError(error) };
  }
}

function toUrlKitError(error: unknown): UrlKitError {
  if (error instanceof UrlKitError) {
    return error;
  }

  return new UrlKitError('invalid-search', 'Schema value is invalid.', { cause: error });
}
