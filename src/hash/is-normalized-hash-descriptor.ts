import type { NormalizedHashDescriptor } from './contracts.js';

export function isNormalizedHashDescriptor(
  input: unknown,
): input is NormalizedHashDescriptor<string | undefined> {
  return (
    isRecord(input) &&
    (input.type === 'string' || input.type === 'enum') &&
    (input.presence === 'required' ||
      input.presence === 'optional' ||
      input.presence === 'defaulted')
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
