import { describe, expect, it } from 'vitest';
import { array } from '../schema/array.js';
import { boolean } from '../schema/boolean.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { serializeSearchEntries } from './serialize-search-entries.js';
import { appendObjectSearchEntries } from './append-object-search-entries.js';

describe('appendObjectSearchEntries', () => {
  it('appends object fields using dotted keys', () => {
    const entries: { key: string; value: string }[] = [];

    appendObjectSearchEntries(entries, 'filter', object({ role: string(), active: boolean() }), {
      role: 'admin',
      active: true,
    });

    expect(serializeSearchEntries(entries)).toBe('?filter.role=admin&filter.active=true');
  });

  it('appends array fields using repeated dotted keys', () => {
    const entries: { key: string; value: string }[] = [];

    appendObjectSearchEntries(entries, 'filter', object({ tags: array(string()) }), {
      tags: ['react', 'router'],
    });

    expect(serializeSearchEntries(entries)).toBe('?filter.tags=react&filter.tags=router');
  });

  it('escapes literal dots in object field names', () => {
    const entries: { key: string; value: string }[] = [];

    appendObjectSearchEntries(entries, 'filter', object({ 'user.name': string() }), {
      'user.name': 'ada',
    });

    expect(serializeSearchEntries(entries)).toBe('?filter.user%7E1name=ada');
  });

  it('escapes literal tildes in object field names', () => {
    const entries: { key: string; value: string }[] = [];

    appendObjectSearchEntries(entries, 'filter', object({ 'path~id': string() }), {
      'path~id': '42',
    });

    expect(serializeSearchEntries(entries)).toBe('?filter.path%7E0id=42');
  });

  it('escapes nested object field segments independently', () => {
    const entries: { key: string; value: string }[] = [];

    appendObjectSearchEntries(
      entries,
      'filter',
      object({ 'user.name': object({ 'path~id': string() }) }),
      {
        'user.name': {
          'path~id': '42',
        },
      },
    );

    expect(serializeSearchEntries(entries)).toBe('?filter.user%7E1name.path%7E0id=42');
  });

  it('escapes array keys inside object fields', () => {
    const entries: { key: string; value: string }[] = [];

    appendObjectSearchEntries(entries, 'filter', object({ 'tag.group': array(string()) }), {
      'tag.group': ['react', 'router'],
    });

    expect(serializeSearchEntries(entries)).toBe(
      '?filter.tag%7E1group=react&filter.tag%7E1group=router',
    );
  });
});
