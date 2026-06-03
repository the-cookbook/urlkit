import type { HashDescriptorInput } from './contracts.js';
import { compileHashDescriptor } from './compile-hash-descriptor.js';
import { readHashFragment } from './hash-fragment.js';

export function parseHash(input: unknown): string | undefined;
export function parseHash(input: unknown, descriptor: HashDescriptorInput): unknown;
export function parseHash(input: unknown, descriptor?: HashDescriptorInput): unknown {
  const hash = readHashFragment(input);

  if (descriptor === undefined) {
    return hash;
  }

  return compileHashDescriptor(descriptor).parse(hash);
}
