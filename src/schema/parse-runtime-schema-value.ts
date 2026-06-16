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
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Type, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): Value {
  return parseCompiledRuntimeSchemaValue(
    compileRuntimeSchemaValue(schema, options),
    input,
    options,
  );
}
