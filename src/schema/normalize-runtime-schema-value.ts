import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
  RuntimeSchemaValueOptions,
} from './contracts.js';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { normalizeCompiledRuntimeSchemaValue } from './normalize-compiled-runtime-schema-value.js';

export function normalizeRuntimeSchemaValue<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Type, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): Value {
  return normalizeCompiledRuntimeSchemaValue(
    compileRuntimeSchemaValue(schema, options),
    input,
    options,
  );
}
