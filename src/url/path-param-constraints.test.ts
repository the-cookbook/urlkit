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
      type: 'parameter',
      name: 'id',
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
      type: 'parameter',
      name: 'id',
      constraints: [{ type: 'int', params: '' }],
    };

    expect(getPathParamConstraints(segment)).toEqual([{ type: 'int', params: '' }]);
  });

  it('returns an empty chain for unconstrained params', () => {
    expect(getPathParamConstraints({ type: 'parameter', name: 'slug' })).toEqual([]);
  });
});
