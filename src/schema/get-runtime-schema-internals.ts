import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
} from './contracts.js';
import {
  runtimeSchemaSymbol,
  type RuntimeSchemaBuilderWithInternals,
} from './runtime-schema-symbol.js';

export function getRuntimeSchemaInternals<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>) {
  const candidate = schema as Partial<
    RuntimeSchemaBuilderWithInternals<Value, Kind, Options, Descriptor>
  >;
  const internals = candidate[runtimeSchemaSymbol];

  if (!internals) {
    throw new UrlKitError('invalid-descriptor', 'Expected a runtime schema builder.');
  }

  return internals;
}
