import type { HashDescriptorInput } from './contracts.js';
import { compileHashDescriptor } from './compile-hash-descriptor.js';
import { readHashFragment } from './hash-fragment.js';

export function normalizeHash(input: unknown): string | undefined;
export function normalizeHash(input: unknown, descriptor: HashDescriptorInput): unknown;
export function normalizeHash(input: unknown, descriptor?: HashDescriptorInput): unknown {
  if (descriptor === undefined) {
    return readHashFragment(input);
  }

  return compileHashDescriptor(descriptor).normalize(input);
}
