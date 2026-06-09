import { describe, expect, it } from 'vitest';
import {
  getPathParamConstraints,
  hasAnyPathParamConstraint,
  hasPathParamConstraint,
} from './path-param-constraints.js';
import type { ParsedPathParamSegment } from './path-segment.js';

describe('path param constraints', () => {
  it('returns full constraint chains when available', () => {
    const segment: ParsedPathParamSegment = {
      kind: 'param',
      name: 'id',
      constraint: 'regex',
      constraintParams: '/\\d/',
      constraints: [
        { type: 'regex', params: '/\\d/' },
        { type: 'min', params: '1' },
      ],
    };

    expect(getPathParamConstraints(segment)).toEqual([
      { type: 'regex', params: '/\\d/' },
      { type: 'min', params: '1' },
    ]);
    expect(hasPathParamConstraint(segment, 'min')).toBe(true);
    expect(hasAnyPathParamConstraint(segment, ['max', 'min'])).toBe(true);
  });

  it('falls back to compatibility aliases', () => {
    const segment: ParsedPathParamSegment = {
      kind: 'param',
      name: 'id',
      constraint: 'int',
    };

    expect(getPathParamConstraints(segment)).toEqual([{ type: 'int', params: '' }]);
  });

  it('returns an empty chain for unconstrained params', () => {
    expect(getPathParamConstraints({ kind: 'param', name: 'slug' })).toEqual([]);
  });
});
