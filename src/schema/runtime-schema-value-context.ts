import type { RuntimeSchemaValueContext, RuntimeSchemaValueOptions } from './contracts.js';

export function createRuntimeSchemaValueContext(
  type: string,
  options: RuntimeSchemaValueOptions = {},
): RuntimeSchemaValueContext {
  return {
    type,
    path: [...(options.path ?? [])],
    errorCode: options.errorCode ?? 'invalid-search',
  };
}
