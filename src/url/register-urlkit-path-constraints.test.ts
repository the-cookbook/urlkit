import match from '@cookbook/pathkit/match';
import { describe, expect, it } from 'vitest';
import { registerUrlKitPathConstraints } from './register-urlkit-path-constraints.js';

describe('registerUrlKitPathConstraints', () => {
  it('registers number constraints for PathKit path matching', () => {
    registerUrlKitPathConstraints();

    const matcher = match('/users/{id:decimal}');

    expect(matcher('/users/42')).toEqual({ match: true, params: { id: '42' } });
    expect(matcher('/users/4.2')).toEqual({ match: true, params: { id: '4.2' } });
    expect(matcher('/users/abc')).toEqual({ match: false, params: null });
  });
});
