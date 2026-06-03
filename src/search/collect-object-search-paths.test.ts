import { describe, expect, it } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { collectObjectSearchPaths } from './collect-object-search-paths.js';

describe('collectObjectSearchPaths', () => {
  it('collects leaf search paths for nested object schemas', () => {
    expect(
      collectObjectSearchPaths(
        object({
          role: string(),
          user: object({
            active: boolean(),
          }),
        }),
      ),
    ).toEqual([['role'], ['user', 'active']]);
  });
});
