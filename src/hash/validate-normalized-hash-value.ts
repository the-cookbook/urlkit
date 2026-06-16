import { UrlKitError } from '../errors/url-kit-error.js';
import type { NormalizedHashDescriptor } from './contracts.js';

const HASH_PATH = Object.freeze(['hash']);

export interface ValidateNormalizedHashValueOptions {
  readonly serialized: boolean;
}

export function validateNormalizedHashValue(
  descriptor: NormalizedHashDescriptor<string | undefined>,
  input: unknown,
  options: ValidateNormalizedHashValueOptions,
): string | undefined {
  if (input === undefined || input === null) {
    if (descriptor.presence === 'optional') {
      return undefined;
    }

    if (descriptor.presence === 'defaulted') {
      return descriptor.defaultValue;
    }

    throw new UrlKitError(
      'invalid-hash',
      input === null ? 'Required hash cannot be null.' : 'Required hash is missing.',
      {
        path: HASH_PATH,
      },
    );
  }

  if (typeof input !== 'string') {
    throw new UrlKitError(
      'invalid-hash',
      options.serialized ? 'Serialized hash must be a string.' : 'Hash must be a string.',
      { path: HASH_PATH },
    );
  }

  if (descriptor.type === 'enum' && !(descriptor.values ?? []).includes(input)) {
    throw new UrlKitError(
      'invalid-hash',
      `Expected hash to be one of: ${(descriptor.values ?? []).join(', ')}.`,
      {
        path: HASH_PATH,
      },
    );
  }

  return input;
}
