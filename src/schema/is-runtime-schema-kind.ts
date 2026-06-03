import type { AnyRuntimeSchemaBuilder } from './contracts.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';

export function isRuntimeSchemaKind(schema: AnyRuntimeSchemaBuilder, kind: string): boolean {
  return getRuntimeSchemaInternals(schema).kind === kind;
}
