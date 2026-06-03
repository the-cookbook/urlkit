import { describe, expect, it } from 'vitest';
import { createObjectSearchPathKey, isObjectSearchPathEqual } from './object-search-path-key.js';

describe('object search path helpers', () => {
  it('creates deterministic keys for path segments', () => {
    expect(createObjectSearchPathKey(['user.name', 'path~id'])).toBe('["user.name","path~id"]');
  });

  it('compares object search paths by segment', () => {
    expect(isObjectSearchPathEqual(['user.name'], ['user.name'])).toBe(true);
    expect(isObjectSearchPathEqual(['user', 'name'], ['user.name'])).toBe(false);
  });
});
