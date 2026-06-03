import type { RuntimeSearchField } from './contracts.js';

export function isRuntimeSearchField(input: unknown): input is RuntimeSearchField {
  return typeof input === 'object' && input !== null && 'value' in input;
}
