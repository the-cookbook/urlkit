import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  BuildHashOptions,
  CompiledHashDescriptor,
  NormalizedHashDescriptor,
} from './contracts.js';

describe('hash contracts', () => {
  it('models normalized and compiled hash descriptors', () => {
    const descriptor: NormalizedHashDescriptor<'comments' | undefined> = {
      type: 'enum',
      presence: 'optional',
      values: ['comments', 'share'],
    };
    const compiled: CompiledHashDescriptor<'comments' | undefined> = {
      descriptor,
      parse: () => 'comments',
      normalize: () => 'comments',
      serialize: () => '#comments',
      isDefault: () => false,
    };
    const options: BuildHashOptions = { defaults: 'omit' };

    expect(compiled.parse('#comments')).toBe('comments');
    expect(options.defaults).toBe('omit');
    expectTypeOf<'string' | 'enum'>(descriptor.type);
  });
});
