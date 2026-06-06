import type { HashDescriptorInput, ParseHashOptions } from './contracts.js';
import { compileHashDescriptor } from './compile-hash-descriptor.js';
import { readHashFragment } from './hash-fragment.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export function parseHash(input: unknown): string | undefined;
export function parseHash(
  input: unknown,
  descriptor: HashDescriptorInput,
  options: ParseHashOptions & { readonly invalidHash: 'omit' },
): string | undefined;
export function parseHash(
  input: unknown,
  descriptor: HashDescriptorInput,
  options?: ParseHashOptions,
): unknown;
export function parseHash(
  input: unknown,
  descriptor?: HashDescriptorInput,
  options: ParseHashOptions = {},
): unknown {
  const hash = readHashFragment(input);

  if (descriptor === undefined) {
    return hash;
  }

  const compiled = compileHashDescriptor(descriptor);

  try {
    return compiled.parse(hash);
  } catch (error) {
    if (options.invalidHash === 'omit' && error instanceof UrlKitError) {
      return compiled.parse(undefined);
    }

    throw error;
  }
}
