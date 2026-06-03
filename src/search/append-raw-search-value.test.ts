import { describe, expect, it } from 'vitest';
import type { RawSearchValue } from './contracts.js';
import { appendRawSearchValue } from './append-raw-search-value.js';

describe('appendRawSearchValue', () => {
  it('stores first values as strings', () => {
    const output: Record<string, RawSearchValue> = {};

    appendRawSearchValue(output, 'q', 'router');

    expect(output).toEqual({ q: 'router' });
  });

  it('stores repeated values as frozen arrays', () => {
    const output: Record<string, RawSearchValue> = {};

    appendRawSearchValue(output, 'tag', 'react');
    appendRawSearchValue(output, 'tag', 'router');

    expect(output).toEqual({ tag: ['react', 'router'] });
    expect(Object.isFrozen(output.tag)).toBe(true);
  });
});
