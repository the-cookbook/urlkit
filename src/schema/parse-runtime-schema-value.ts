import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
  RuntimeSchemaValueOptions,
} from './contracts.js';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { parseCompiledRuntimeSchemaValue } from './parse-compiled-runtime-schema-value.js';

export function parseRuntimeSchemaValue<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): Value {
  return parseCompiledRuntimeSchemaValue(
    compileRuntimeSchemaValue(schema, options),
    input,
    options,
  );
}
