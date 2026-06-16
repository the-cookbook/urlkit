import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
  RuntimeSchemaValueOptions,
} from './contracts.js';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { serializeCompiledRuntimeSchemaValue } from './serialize-compiled-runtime-schema-value.js';

export function serializeRuntimeSchemaValue<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Type, Options, Descriptor>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): string | undefined {
  return serializeCompiledRuntimeSchemaValue(
    compileRuntimeSchemaValue(schema, options),
    input,
    options,
  );
}
