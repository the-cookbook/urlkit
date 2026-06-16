import { describe, expect, it } from 'vitest';
import { array } from '../schema/array.js';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { parseObjectSearchValue } from './parse-object-search-value.js';

const context = { type: 'search' as const, path: ['filter'], errorCode: 'invalid-search' as const };

describe('parseObjectSearchValue', () => {
  it('hydrates only declared object fields from dotted keys', () => {
    const schema = object({
      role: string(),
      active: boolean().optional(),
      ids: array(int()).default([]),
    });

    expect(
      parseObjectSearchValue(
        schema,
        'filter',
        { 'filter.role': 'admin', 'filter.active': 'true', 'filter.ids': ['1', '2'] },
        context,
      ),
    ).toEqual({ role: 'admin', active: true, ids: [1, 2] });
  });

  it('splits comma-separated arrays inside object fields when requested', () => {
    const schema = object({
      tags: array(string()),
    });

    expect(
      parseObjectSearchValue(schema, 'filter', { 'filter.tags': 'react,router' }, context, {
        arrayFormat: 'comma',
      }),
    ).toEqual({ tags: ['react', 'router'] });
  });

  it('supports nested object defaults and optional absence', () => {
    const schema = object({
      nested: object({ role: string().default('reader'), label: string().optional() }),
    });

    expect(parseObjectSearchValue(schema, 'filter', {}, context)).toEqual({
      nested: { role: 'reader' },
    });
  });

  it('applies optional and defaulted object absence behavior', () => {
    expect(
      parseObjectSearchValue(object({ role: string() }).optional() as never, 'filter', {}, context),
    ).toBeUndefined();
    expect(
      parseObjectSearchValue(
        object({ role: string() }).default({ role: 'admin' }) as never,
        'filter',
        {},
        context,
      ),
    ).toEqual({
      role: 'admin',
    });
  });

  it('detects duplicate scalar and escaped object path collisions', () => {
    const schema = object({ role: string(), 'path~id': string().optional() });

    expect(() =>
      parseObjectSearchValue(schema, 'filter', { 'filter.role': ['admin', 'user'] }, context),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['filter', 'role'] }));
    expect(() =>
      parseObjectSearchValue(
        schema,
        'filter',
        { 'filter.path~id': 'a', 'filter.path~0id': 'b' },
        context,
      ),
    ).toThrow(expect.objectContaining({ code: 'invalid-search' }));
  });

  it('keeps correctly escaped literal keys and nested keys distinguishable', () => {
    const schema = object({ user: object({ name: string() }), 'user.name': string() });

    expect(
      parseObjectSearchValue(
        schema,
        'filter',
        { 'filter.user.name': 'nested', 'filter.user~1name': 'literal' },
        context,
      ),
    ).toEqual({ user: { name: 'nested' }, 'user.name': 'literal' });
  });
});
