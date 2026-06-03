import { describe, expect, it } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { serializeSearchBuildValue } from './serialize-search-build-value.js';

const [enabled, tags] = compileSearchSchema({
  enabled: boolean(),
  tag: { type: 'many', value: string() },
}).fields;

describe('serializeSearchBuildValue', () => {
  it('serializes one values', () => {
    expect(serializeSearchBuildValue(enabled!, true)).toBe('true');
  });

  it('serializes many values', () => {
    expect(serializeSearchBuildValue(tags!, ['react', 'router'])).toEqual(['react', 'router']);
  });

  it('omits empty many values', () => {
    expect(serializeSearchBuildValue(tags!, [])).toBeUndefined();
  });
});
