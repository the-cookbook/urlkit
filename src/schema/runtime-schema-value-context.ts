import type { RuntimeSchemaValueContext, RuntimeSchemaValueOptions } from './contracts.js';

export function createRuntimeSchemaValueContext(
  kind: string,
  options: RuntimeSchemaValueOptions = {},
): RuntimeSchemaValueContext {
  return {
    kind,
    path: [...(options.path ?? [])],
    errorCode: options.errorCode ?? 'invalid-search',
  };
}
