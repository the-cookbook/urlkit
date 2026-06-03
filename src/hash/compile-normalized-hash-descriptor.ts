import type { CompiledHashDescriptor, NormalizedHashDescriptor } from './contracts.js';
import { copyNormalizedHashDescriptor } from './copy-normalized-hash-descriptor.js';
import { validateNormalizedHashValue } from './validate-normalized-hash-value.js';

export function compileNormalizedHashDescriptor(
  descriptor: NormalizedHashDescriptor<string | undefined>,
): CompiledHashDescriptor<string | undefined> {
  const normalizedDescriptor = copyNormalizedHashDescriptor(descriptor);

  return Object.freeze({
    descriptor: normalizedDescriptor,
    parse(input: unknown) {
      return validateNormalizedHashValue(normalizedDescriptor, input, { serialized: true });
    },
    normalize(input: unknown) {
      return validateNormalizedHashValue(normalizedDescriptor, input, { serialized: false });
    },
    serialize(input: unknown) {
      const value = validateNormalizedHashValue(normalizedDescriptor, input, { serialized: false });
      return value ?? undefined;
    },
    isDefault(input: unknown) {
      if (normalizedDescriptor.presence !== 'defaulted') {
        return false;
      }

      return (
        validateNormalizedHashValue(normalizedDescriptor, input, { serialized: false }) ===
        normalizedDescriptor.defaultValue
      );
    },
  });
}
