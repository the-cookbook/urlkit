import { describe, expect, it } from 'vitest';
import { readArraySearchValues } from './search-array-format.js';

describe('readArraySearchValues', () => {
  it('returns undefined for absent raw values', () => {
    expect(readArraySearchValues(undefined)).toBeUndefined();
  });

  it('keeps repeated values by default', () => {
    expect(readArraySearchValues(['react', 'router'])).toEqual(['react', 'router']);
    expect(readArraySearchValues('react,router')).toEqual(['react,router']);
  });

  it('splits comma-separated values when requested', () => {
    expect(readArraySearchValues('react,router', 'comma')).toEqual(['react', 'router']);
    expect(readArraySearchValues(['react,router', 'url'], 'comma')).toEqual([
      'react',
      'router',
      'url',
    ]);
  });
});
