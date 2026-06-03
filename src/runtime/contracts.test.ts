import { describe, expect, it } from 'vitest';
import type { CreateRouteUrlContractOptions } from './contracts.js';

function expectType<Value>(_value: Value): void {}

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
    expectType<'raw' | 'parsed' | undefined>(raw.params);
  });
});
