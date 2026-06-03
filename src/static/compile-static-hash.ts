import type { NormalizedHashDescriptor } from '../hash/contracts.js';
import { compileStaticHashDescriptor } from '../hash/compile-static-hash-descriptor.js';
import type { InferStaticHash, StaticHashDescriptor } from './contracts.js';

export function compileStaticHash<Descriptor extends StaticHashDescriptor>(
  descriptor: Descriptor,
): NormalizedHashDescriptor<InferStaticHash<Descriptor>> {
  return compileStaticHashDescriptor(descriptor) as NormalizedHashDescriptor<
    InferStaticHash<Descriptor>
  >;
}
