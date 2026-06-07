import { describe, expect, it, expectTypeOf } from 'vitest';
import type { CreateRouteUrlContractOptions } from './contracts.js';

describe('runtime contracts', () => {
  it('keeps router-runtime params mode limited to raw or parsed', () => {
    const raw: CreateRouteUrlContractOptions = { params: 'raw' };
    const parsed: CreateRouteUrlContractOptions = { params: 'parsed' };
    const omitted: CreateRouteUrlContractOptions = {};
    const withOptions: CreateRouteUrlContractOptions = {
      arrayFormat: 'comma',
      unknownSearch: 'preserve',
      pathConstraints: {},
    };

    expect(raw.params).toBe('raw');
    expect(parsed.params).toBe('parsed');
    expect(omitted.params).toBeUndefined();
    expect(withOptions.arrayFormat).toBe('comma');
    expect(withOptions.pathConstraints).toEqual({});
    expectTypeOf<'raw' | 'parsed' | undefined>(raw.params);
  });
});
