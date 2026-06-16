import type { AnyRuntimeSchemaBuilder } from './contracts.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';

export function isRuntimeSchemaType(schema: AnyRuntimeSchemaBuilder, type: string): boolean {
  return getRuntimeSchemaInternals(schema).type === type;
}
