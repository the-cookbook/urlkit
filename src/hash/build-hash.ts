import type { BuildUrlOptions } from '../contracts.js';
import type { HashDescriptorInput } from './contracts.js';
import { compileHashDescriptor } from './compile-hash-descriptor.js';
import { writeHashFragment } from './hash-fragment.js';

export function buildHash(hash?: unknown, options?: BuildUrlOptions): string;
export function buildHash(
  hash: unknown,
  descriptor: HashDescriptorInput,
  options?: BuildUrlOptions,
): string;
export function buildHash(
  hash?: unknown,
  descriptorOrOptions?: HashDescriptorInput | BuildUrlOptions,
  options?: BuildUrlOptions,
): string {
  const descriptor = isBuildUrlOptions(descriptorOrOptions) ? undefined : descriptorOrOptions;
  const buildOptions = isBuildUrlOptions(descriptorOrOptions) ? descriptorOrOptions : options;
  const compiled = compileHashDescriptor(descriptor);

  if (
    buildOptions?.defaults === 'omit' &&
    hash !== undefined &&
    hash !== null &&
    compiled.isDefault(hash)
  ) {
    return '';
  }

  if (
    buildOptions?.defaults === 'omit' &&
    (hash === undefined || hash === null) &&
    compiled.descriptor.presence !== 'required'
  ) {
    return '';
  }

  const value = compiled.serialize(hash);
  return value === undefined ? '' : writeHashFragment(value);
}

function isBuildUrlOptions(input: unknown): input is BuildUrlOptions {
  return (
    typeof input === 'object' && input !== null && !Array.isArray(input) && 'defaults' in input
  );
}
